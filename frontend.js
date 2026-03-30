// OpenCommand Center — Monitor Frame UI
// Natural language + JSON input, iframe postMessage API

const AGENT_REGISTRY_URL = 'agent_registry.json';
const AGENT_RUN_ENDPOINT = '/agent/run';

let agents = [];
let isIframe = false;
let isJsonMode = false;
let serverConnected = false;
let lastSelectedAgent = null;

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

function setStatus(state, detail) {
  const dot = el('#status-dot');
  const text = el('#status-text');
  if (!dot || !text) return;
  dot.className = 'status-dot ' + state;
  text.textContent = detail || '';
}

function sendToParent(message) {
  if (isIframe && window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}

// ── Natural Language Parser ─────────────────────────────────────────────────

function parseNaturalLanguage(text) {
  const t = text.toLowerCase().trim();

  if (t === 'ping' || t === 'hello' || t === 'hi') return { action: 'ping' };
  if (t === 'verify resources' || t === 'check resources' || t === 'verify links' || t === 'check links') return { action: 'verify_resources' };
  if (t.startsWith('start session') || t.startsWith('start recording')) return { action: 'start_session', blockchain: extractBlockchain(t) };
  if (t.startsWith('record') || t.includes('record audio')) return { action: 'record_audio' };
  if (t.includes('save to blockchain') || t.includes('save to chain') || t.includes('mint') || t.includes('inscribe')) return { action: 'save_to_blockchain', blockchain: extractBlockchain(t) };
  if (t.includes('compose') || t.includes('make a beat') || t.includes('create track')) return { action: 'compose', genre: extractGenre(t), bpm: extractBpm(t) };
  if (t.includes('mix')) return { action: 'mix', preset: 'balanced' };
  if (t.includes('refine') || t.includes('master')) return { action: 'refine', enhancements: [] };
  if (t.includes('pay') || t.includes('payment') || t.includes('checkout')) return { action: 'process_payment' };
  if (t.includes('balance') || t.includes('check balance')) return { action: 'balance_check' };
  if (t.includes('approve') || t.includes('approved')) return { action: 'approve' };
  if (t.includes('escalate') || t.includes('escalation')) return { action: 'escalate' };
  if (t.includes('strategy')) return { action: 'strategy' };
  if (t.includes('orchestrate') || t.includes('coordinate')) return { action: 'orchestrate' };
  if (t.includes('monitor') || t.includes('check status')) return { action: 'monitor' };
  if (t.includes('schedule')) return { action: 'schedule' };
  if (t.includes('deploy')) return { action: 'deploy' };
  if (t.includes('scan') || t.includes('security check')) return { action: 'scan_transactions' };
  if (t.includes('risk') || t.includes('risk assessment')) return { action: 'risk_assessment' };
  if (t.includes('alert') || t.includes('warning')) return { action: 'alert' };
  if (t.includes('validate') || t.includes('verify')) return { action: 'validate' };
  if (t.includes('inscribe ordinal') || t.includes('inscribe')) return { action: 'inscribe_ordinal' };
  if (t.includes('inscribe doginal') || t.includes('doginal')) return { action: 'inscribe_doginal' };
  if (t.includes('inscribe litescribe') || t.includes('litescribe')) return { action: 'inscribe_litescribe' };
  if (t.includes('tezos') || t.includes('objkt')) return { action: 'mint_objkt_nft' };
  if (t.includes('bitcoin balance') || t.includes('btc balance')) return { action: 'get_balance', chain: 'bitcoin' };
  if (t.includes('fractal balance') || t.includes('fb balance')) return { action: 'get_balance', chain: 'fractal' };
  if (t.includes('litecoin balance') || t.includes('ltc balance')) return { action: 'get_balance', chain: 'litecoin' };
  if (t.includes('dogecoin balance') || t.includes('doge balance')) return { action: 'get_balance', chain: 'dogecoin' };

  return { action: 'interpret', text };
}

function extractBlockchain(text) {
  if (text.includes('bitcoin') || text.includes('btc')) return 'bitcoin';
  if (text.includes('fractal') || text.includes('fb')) return 'fractal';
  if (text.includes('litecoin') || text.includes('ltc')) return 'litecoin';
  if (text.includes('dogecoin') || text.includes('doge')) return 'dogecoin';
  if (text.includes('tezos') || text.includes('xtz')) return 'tezos';
  return 'bitcoin';
}

function extractGenre(text) {
  const genres = ['hip-hop','trap','lo-fi','jazz','electronic','rock','pop','r&b','afrobeats','drill'];
  for (const g of genres) { if (text.includes(g)) return g; }
  return 'hip-hop';
}

function extractBpm(text) {
  const m = text.match(/(\d+)\s*bpm/i);
  return m ? parseInt(m[1]) : 120;
}

// ── Connection Check ─────────────────────────────────────────────────────

async function checkConnection() {
  try {
    const r = await fetch('/health', { method: 'GET' });
    if (r.ok) {
      serverConnected = true;
      setStatus('connected', 'Connected to Xaeon Cloud');
      return true;
    }
  } catch (_) {}
  serverConnected = false;
  setStatus('disconnected', 'Server offline — run: node server.js');
  return false;
}

// ── UI Rendering ────────────────────────────────────────────────────────────

function renderAgents() {
  const container = el('#agents');
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(agents) || agents.length === 0) {
    container.innerHTML = '<div class="no-agents">No agents loaded. Check server connection.</div>';
    return;
  }

  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.agentId = agent.id;
    card.innerHTML = `
      <div class="icon">${agent.icon || '🤖'}</div>
      <h3>${agent.name}</h3>
      <div class="role">${agent.role}</div>
    `;
    card.addEventListener('click', (e) => {
      e.preventDefault();
      selectAgent(agent, card);
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAgent(agent, card);
      }
    });
    container.appendChild(card);
  });
}

function selectAgent(agent, card) {
  // Deselect previous
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
  // Select new
  if (card) {
    card.classList.add('selected');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  lastSelectedAgent = agent;
  // Auto-trigger if there's text
  const input = el('#payload-input');
  if (input && input.value.trim()) {
    activateAgent(agent);
  } else {
    log(`Selected: <span style="color:#00ffcc">${agent.name}</span> — type a command and press Enter`, 'info');
  }
}

async function loadRegistry() {
  try {
    const r = await fetch(AGENT_REGISTRY_URL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    agents = Array.isArray(data) ? data : (data.agents || []);
    renderAgents();
    log(`Connected — ${agents.length} agents loaded. Select an agent and type a command.`, 'success');
  } catch (e) {
    log(`Error: ${e.message}. Is the server running?`, 'error');
    setStatus('disconnected', 'Server offline — run: node server.js');
  }
}

// ── Mode Toggle ─────────────────────────────────────────────────────────────

function toggleMode() {
  isJsonMode = !isJsonMode;
  const input = el('#payload-input');
  const toggleBtn = el('#mode-toggle');
  if (isJsonMode) {
    input.placeholder = 'Enter JSON payload, e.g. {"action":"verify_resources"}';
    input.value = '';
    toggleBtn.textContent = 'NL';
    toggleBtn.title = 'Switch to Natural Language mode';
    el('.mode-hint').textContent = 'JSON mode — enter raw JSON';
  } else {
    input.placeholder = 'Type a command in plain English...&#10;E.g. "verify resources" or "compose a trap beat at 140 bpm"';
    input.value = '';
    toggleBtn.textContent = '{ }';
    toggleBtn.title = 'Switch to JSON mode';
    el('.mode-hint').textContent = 'Natural Language mode — just type what you want';
  }
}

// ── Agent Activation ────────────────────────────────────────────────────────

async function activateAgent(agent, overridePayload) {
  if (!serverConnected) {
    log('Server is offline. Run: <span style="color:#ff9966">node server.js</span>', 'error');
    return;
  }

  const skill = 'openclaw';
  const inputText = overridePayload ? null : el('#payload-input')?.value.trim();
  let payload;

  if (overridePayload) {
    payload = overridePayload;
  } else if (!inputText) {
    log('Select an agent, type a command, and press Enter.', 'error');
    return;
  } else if (isJsonMode) {
    try { payload = JSON.parse(inputText); }
    catch (e) {
      log('Invalid JSON. Fix it or switch to Natural Language mode.', 'error');
      return;
    }
  } else {
    payload = parseNaturalLanguage(inputText);
    log(`Parsed: <span style="color:#ffaa00">${JSON.stringify(payload)}</span>`, 'info');
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
      const r = result.result || {};
      if (r.thumbsUp === true) {
        log(`<span style="font-size:16px">✅ THUMBS UP — ${r.message || 'All verified!'}</span>`, 'success');
      } else if (r.thumbsUp === false) {
        log(`❌ Verification failed — missing: <span style="color:#ff9966">${(r.missing || []).join(', ')}</span>`, 'error');
      } else {
        log(`<span style="color:#4caf50">${JSON.stringify(result.result)}</span>`, 'success');
      }
      sendToParent({ type: 'agent_result', agent: agent.id, result: result.result, thumbsUp: r.thumbsUp });
    } else {
      log(`Error: <span style="color:#ff6666">${result.error}</span>`, 'error');
      sendToParent({ type: 'agent_error', agent: agent.id, error: result.error });
    }
  } catch (err) {
    log('Connection timeout or network error. Is the server running?', 'error');
    setStatus('disconnected', 'Server offline — run: node server.js');
    sendToParent({ type: 'agent_error', agent: agent.id, error: 'Network error' });
  }
}

// ── Enter Key on Textarea ──────────────────────────────────────────────────
el('#payload-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!lastSelectedAgent) {
      log('Select an agent card first, then type a command.', 'error');
      return;
    }
    activateAgent(lastSelectedAgent);
  }
});

// ── postMessage API ──────────────────────────────────────────────────────────
const KNOWN_MESSAGE_TYPES = new Set([
  'activate', 'ping', 'get_agents', 'set_payload', 'EXTENSION_VERSION'
]);

window.addEventListener('message', async (event) => {
  const data = event.data || {};
  const type = data.type;

  if (!type || type.startsWith('channel-secure') || type === 'EXTENSION_VERSION') return;

  if (!KNOWN_MESSAGE_TYPES.has(type)) {
    log(`Unknown postMessage type: ${type}`, 'error');
    return;
  }

  const { agent, payload } = data;

  switch (type) {
    case 'activate': {
      const target = agents.find(a => a.id === agent || a.role === agent);
      if (target) await activateAgent(target, payload);
      else { log(`Agent not found: ${agent}`, 'error'); sendToParent({ type: 'agent_error', agent, error: 'Agent not found' }); }
      break;
    }
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
  }
});

try { isIframe = window.self !== window.top; } catch (e) { isIframe = true; }

if (isIframe) {
  window.addEventListener('load', () => {
    sendToParent({ type: 'iframe_ready', pathname: window.location.pathname });
  });
}

// Initialize
checkConnection().then(connected => {
  if (connected) loadRegistry();
});
