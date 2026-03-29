const express = require('express');
const path = require('path');
const { AgentManager } = require('./AgentManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Initialize agent framework
const manager = new AgentManager();
manager.loadRegistry('agent_registry.json')
  .then(() => console.log('AgentManager: registry loaded'))
  .catch(err => console.error('AgentManager load error:', err));

// Task dispatch endpoint used by frontend
app.post('/agent/run', async (req, res) => {
  const { agent, skill, ...rest } = req.body;
  if (!agent) {
    return res.status(400).json({ success: false, error: 'Missing agent' });
  }
  try {
    // Merge rest into payload as top-level fields
    const payload = { ...rest, skill };
    const result = await manager.handle(agent, payload);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  const agents = manager.agents || manager.listAgents ? manager.listAgents().map(a => ({
    id: a.id,
    status: a.getStatus ? a.getStatus() : 'unknown'
  })) : [];
  res.json({ status: 'ok', agents });
});

app.listen(PORT, () => console.log(`OpenCommand Center listening on http://localhost:${PORT}`));
