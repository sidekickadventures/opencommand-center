const express = require('express');
const path = require('path');
const { AgentManager } = require('./AgentManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.')); // serve current directory (index.html, style.css, frontend.js, agent_registry.json)

// Initialize agent framework
const manager = new AgentManager();
manager.loadRegistry('agent_registry.json').catch(console.error);

// Task dispatch endpoint
app.post('/agents/:agentId/task', async (req, res) => {
  const { agentId } = req.params;
  const payload = req.body;
  try {
    const result = await manager.handle(agentId, payload);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', agents: manager.listAgents().map(a => ({ id: a.id, status: a.getStatus() })) }));

app.listen(PORT, () => console.log(`OpenCommand Center UI running on http://localhost:${PORT}`));
