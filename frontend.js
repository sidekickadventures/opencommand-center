// OpenCommand Center Frontend
// Loads agent registry, renders cards, and dispatches tasks via fetch or WebSocket

const AGENT_REGISTRY_URL = 'agent_registry.json';
const API_BASE = ''; // same origin; adjust if backend is separate

let agents = [];
let ws = null;

// Utility
function el(selector) { return document.querySelector(selector); }
function showModal(agent) {
  el('#modal').classList.remove('hidden');
  el('#agent-id').value = agent.id;
  el('#modal-title').textContent = `Send task to ${agent.name}`;
  el('#task-payload').value = JSON.stringify({ action: 'ping' }, null, 2);
  el('#result-output').classList.add('hidden');
  el('#task-payload').focus();
}
function hideModal() { el('#modal').classList.add('hidden'); }

// Render agents into panels (3 columns)
function renderAgents() {
  const panels = {
    left: el('#left-panel'),
    center: el('#center-panel'),
    right: el('#right-panel')
  };
  // Clear panels
  Object.values(panels).forEach(p => p.innerHTML = '');

  // Sort by panel + x,y to keep visual order
  agents.sort((a, b) => {
    const panelOrder = { left: 0, center: 1, right: 2 };
    const pa = panelOrder[a.panel], pb = panelOrder[b.panel];
    if (pa !== pb) return pa - pb;
    return a.y - b.y || a.x - b.x;
  });

  // Create cards
  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.innerHTML = `
      <div class="agent-icon">${agent.icon || '🤖'}</div>
      <div class="agent-info">
        <h3>${agent.name}</h3>
        <div class="role">${agent.role}</div>
      </div>
      <div class="agent-status idle" id="status-${agent.id}">idle</div>
      <div class="agent-actions">
        <button data-id="${agent.id}">Send Task</button>
      </div>
    `;
    panels[agent.panel].appendChild(card);
  });

  // Bind click handlers
  document.querySelectorAll('.agent-actions button').forEach(btn => {
    btn.addEventListener('click', () => {
      const agent = agents.find(a => a.id === btn.dataset.id);
      if (agent) showModal(agent);
    });
  });
}

// Dispatch task to agent (REST or WebSocket)
async function dispatchTask(agentId, payload) {
  setStatus(agentId, 'active');
  const endpoint = `${API_BASE}/agents/${agentId}/task`;
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await resp.json();
    setStatus(agentId, 'idle');
    return result;
  } catch (err) {
    setStatus(agentId, 'error');
    throw err;
  }
}

function setStatus(agentId, status) {
  const el = document.getElementById(`status-${agentId}`);
  if (el) {
    el.className = `agent-status ${status}`;
    el.textContent = status;
  }
}

// Load agent registry
async function loadRegistry() {
  try {
    const r = await fetch(AGENT_REGISTRY_URL);
    if (!r.ok) throw new Error('Failed to load agent_registry.json');
    agents = await r.json();
    renderAgents();
    el('#status-bar').textContent = `Loaded ${agents.length} agents`;
  } catch (e) {
    console.error(e);
    el('#status-bar').textContent = 'Error loading agents';
  }
}

// Modal form submit
el('#task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const agentId = el('#agent-id').value;
  const raw = el('#task-payload').value;
  let payload;
  try { payload = JSON.parse(raw); } catch (err) {
    alert('Invalid JSON payload');
    return;
  }
  const out = el('#result-output');
  out.classList.remove('hidden');
  out.textContent = 'Sending...';
  try {
    const result = await dispatchTask(agentId, payload);
    out.textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    out.textContent = `Error: ${err.message}`;
    setStatus(agentId, 'error');
  }
});

// Cancel
el('#cancel-btn').addEventListener('click', hideModal);

// Initialize
loadRegistry();
