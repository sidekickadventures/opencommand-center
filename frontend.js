// OpenCommand Center — Monitor Frame UI
// Loads agents from agent_registry.json and dispatches tasks to /agent/run
// Supports iframe embedding via postMessage API

const AGENT_REGISTRY_URL = 'agent_registry.json';
const AGENT_RUN_ENDPOINT = '/agent/run';

let agents = [];
let isIframe = false;

function el(selector) { return document.querySelector(selector); }

function now() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function log(message, type = 'info') {
  const container = el('#log');
  if (!container) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="timestamp">[${now()}]</span> ${message}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function sendToParent(message) {
  if (isIframe && window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}

function renderAgents() {
  const container = el('#agents');
  if (!container) return;
  container.innerHTML = '';
  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="icon">${agent.icon || '🤖'}</div>
      <h3>${agent.name}</h3>
      <div class="role">${agent.role}</div>
    `;
    card.addEventListener('click', (e) => {
      e.preventDefault();
      activateAgent(agent);
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateAgent(agent);
      }
    });
    container.appendChild(card);
  });
  log(`Loaded ${agents.length} agents.`, 'info');
}

async function loadRegistry() {
  try {
    const r = await fetch(AGENT_REGISTRY_URL);
    if (!r.ok) throw new Error('Failed to load agent_registry.json');
    agents = await r.json();
    renderAgents();
  } catch (e) {
    log('Error loading agents: ' + e.message, 'error');
  }
}

async function activateAgent(agent, overridePayload) {
  const skill = 'openclaw';
  const payloadText = overridePayload ? null : el('#payload-input')?.value.trim();
  let payload;
  if (overridePayload) {
    payload = overridePayload;
  } else if (payloadText) {
    try { payload = JSON.parse(payloadText); } catch (e) {
      log('Invalid JSON payload.', 'error');
      return;
    }
  } else {
    payload = { action: 'ping' };
  }

  log(`Activating <span style="color:#00ffcc">${agent.name}</span>...`, 'info');
  sendToParent({ type: 'agent_activating', agent: agent.id, name: agent.name });

  try {
    const resp = await fetch(AGENT_RUN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: agent.id, skill, ...payload })
    });
    const result = await resp.json();
    if (result.success) {
      log(`Success: <span style="color:#4caf50">${JSON.stringify(result.result)}</span>`, 'success');
      sendToParent({ type: 'agent_result', agent: agent.id, result: result.result, thumbsUp: result.result?.thumbsUp });
    } else {
      log(`Error: <span style="color:#ff6666">${result.error}</span>`, 'error');
      sendToParent({ type: 'agent_error', agent: agent.id, error: result.error });
    }
  } catch (err) {
    log('Connection timeout or network error.', 'error');
    sendToParent({ type: 'agent_error', agent: agent.id, error: 'Network error' });
  }
}

// ── postMessage API (iframe control) ────────────────────────────────────────
window.addEventListener('message', async (event) => {
  const { type, agent, payload } = event.data || {};
  if (!type) return;

  switch (type) {
    case 'activate':
      // External host can trigger an agent by name or id
      const target = agents.find(a => a.id === agent || a.role === agent);
      if (target) {
        await activateAgent(target, payload);
      } else {
        log(`Agent not found: ${agent}`, 'error');
        sendToParent({ type: 'agent_error', agent, error: 'Agent not found' });
      }
      break;

    case 'ping':
      sendToParent({ type: 'pong', timestamp: Date.now() });
      break;

    case 'get_agents':
      sendToParent({ type: 'agents_list', agents });
      break;

    case 'set_payload':
      if (el('#payload-input')) {
        el('#payload-input').value = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
      }
      break;

    default:
      log(`Unknown postMessage type: ${type}`, 'error');
  }
});

// Detect iframe
try { isIframe = window.self !== window.top; } catch (e) { isIframe = true; }

// Signal ready to parent
if (isIframe) {
  window.addEventListener('load', () => {
    sendToParent({ type: 'iframe_ready', pathname: window.location.pathname });
  });
}

// Initialize
loadRegistry();
