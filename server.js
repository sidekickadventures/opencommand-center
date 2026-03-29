// server.js — Express-based static file server + /agent/run dispatch
// Wires directly to AgentManager which registers all agent classes at startup
require('dotenv').config();
const express = require('express');
const path = require('path');
const { loadRegistry, listAgents, handle } = require('./AgentManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// ── Agent dispatch ─────────────────────────────────────────────────────────
app.post('/agent/run', async (req, res) => {
  const { agent, skill, ...rest } = req.body;
  if (!agent) {
    return res.status(400).json({ success: false, error: 'Missing agent field' });
  }
  try {
    const payload = { ...rest, skill: skill || 'openclaw' };
    const result = await handle(agent, payload);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Health / status ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const agentList = listAgents().map(a => ({
    id: a.id,
    name: a.name,
    role: a.role,
    state: a.state || 'idle'
  }));
  res.json({ status: 'ok', agents: agentList });
});

// ── iframe postMessage relay (optional CORS helper) ─────────────────────────
app.get('/postmessage-helper', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ hint: 'Use window.parent.postMessage from inside the iframe' });
});

// Bootstrap: load registry then start server
loadRegistry()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`OpenCommand Center listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to load registry:', err);
    process.exit(1);
  });
