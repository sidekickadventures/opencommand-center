// server.js — Express-based static file server + /agent/run dispatch
require('dotenv').config();
const express = require('express');
const path = require('path');
const { loadRegistry, listAgents, handle } = require('./AgentManager');
const { getReconnectNotifier } = require('./reconnect_notifier');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

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

app.get('/health', (req, res) => {
  const agentList = listAgents().map(a => ({
    id: a.id, name: a.name, role: a.role, state: a.state || 'idle'
  }));
  res.json({ status: 'ok', agents: agentList });
});

app.get('/startup-status', (req, res) => {
  const notifier = getReconnectNotifier('7650513353');
  const { statusMessage, missedTasks } = notifier.notifyAndPrompt();
  res.json({
    statusMessage,
    missedTaskCount: missedTasks.length,
    joke: notifier.getRandomJoke()
  });
});

app.get('/postmessage-helper', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ hint: 'Use window.parent.postMessage from inside the iframe' });
});

loadRegistry()
  .then(() => {
    app.listen(PORT, () => {
      const notifier = getReconnectNotifier('7650513353');
      const { statusMessage, missedTasks } = notifier.notifyAndPrompt();
      console.log('\n══════════════════════════════════════');
      console.log('  🔔 RECONNECT NOTIFICATION');
      console.log('══════════════════════════════════════');
      console.log(statusMessage.replace(/[*_]/g, ''));
      if (missedTasks.length > 0) {
        console.log(`\n  ${notifier.getRandomJoke()}`);
      }
      console.log(`\nOpenCommand Center listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to load registry:', err);
    process.exit(1);
  });
