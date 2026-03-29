// OpenCommand Center Frontend — Command/Log style
// Loads agent registry, populates dropdown, sends tasks to /agent/run

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

function populateAgents() {
  const select = el('#agent-select');
  select.innerHTML = '<option value="">Select agent...</option>';
  agents.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.name} (${a.role})`;
    select.appendChild(opt);
  });
}

async function loadRegistry() {
  try {
    const r = await fetch(AGENT_REGISTRY_URL);
    if (!r.ok) throw new Error('Failed to load agent_registry.json');
    agents = await r.json();
    populateAgents();
    log('System ready. ' + agents.length + ' agents loaded.', 'info');
  } catch (e) {
    log('Error loading agents: ' + e.message, 'error');
  }
}

async function sendTask() {
  const agent = el('#agent-select').value;
  const skill = el('#skill-input').value.trim();
  const prompt = el('#prompt-input').value.trim();

  if (!agent) {
    log('Select an agent first.', 'error');
    return;
  }
  if (!prompt) {
    log('Enter a task payload.', 'error');
    return;
  }

  let payload;
  try { payload = JSON.parse(prompt); } catch (e) {
    log('Invalid JSON in payload.', 'error');
    return;
  }

  log(`Sending to ${agent} (skill: ${skill || 'openclaw'})...`, 'info');

  try {
    const resp = await fetch(AGENT_RUN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, skill, ...payload })
    });
    const result = await resp.json();
    if (result.success) {
      log(`Success: ${JSON.stringify(result.result)}`, 'success');
    } else {
      log(`Error: ${result.error}`, 'error');
    }
  } catch (err) {
    log('Connection timeout or network error.', 'error');
  }
}

el('#send-btn').addEventListener('click', sendTask);
el('#prompt-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendTask();
  }
});

loadRegistry();
