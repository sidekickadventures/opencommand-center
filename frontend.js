// OpenCommand Center — Monitor Frame UI
// Loads agents from agent_registry.json and dispatches tasks to /agent/run

const AGENT_REGISTRY_URL = 'agent_registry.json';
const AGENT_RUN_ENDPOINT = '/agent/run';

let agents = [];

function el(selector) { return document.querySelector(selector); }

function now() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function log(message, type = 'info') {
  const container = el('#log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="timestamp">[${now()}]</span> ${message}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function renderAgents() {
  const container = el('#agents');
  container.innerHTML = '';
  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="icon">${agent.icon || '🤖'}</div>
      <h3>${agent.name}</h3>
      <div class="role">${agent.role}</div>
    `;
    card.addEventListener('click', () => activateAgent(agent));
    container.appendChild(card);
  });
  log(`Loaded ${agents.length} agents from registry.`, 'info');
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

async function activateAgent(agent) {
  const skill = 'openclaw';
  const payloadText = el('#payload-input').value.trim();
  let payload;
  if (payloadText) {
    try { payload = JSON.parse(payloadText); } catch (e) {
      log('Invalid JSON payload.', 'error');
      return;
    }
  } else {
    payload = { action: 'ping' };
  }
  
  log(`Activating <span style="color:#00ffcc">${agent.name}</span> (skill: ${skill})...`, 'info');

  try {
    const resp = await fetch(AGENT_RUN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: agent.id, skill, ...payload })
    });
    const result = await resp.json();
    if (result.success) {
      log(`Success: <span style="color:#4caf50">${JSON.stringify(result.result)}</span>`, 'success');
    } else {
      log(`Error: <span style="color:#ff6666">${result.error}</span>`, 'error');
    }
  } catch (err) {
    log('Connection timeout or network error.', 'error');
  }
}

// Initialize
loadRegistry();
