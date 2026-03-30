// server.js — Express-based static file server + /agent/run dispatch
require('dotenv').config();
const express = require('express');
const path = require('path');
const { loadRegistry, listAgents, handle, spawnAllAgents } = require('./AgentManager');
const { getReconnectNotifier } = require('./reconnect_notifier');
const { getSubAgentCheckIn } = require('./subagent_checkin');

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

// Returns all agents' check-in status (for main bot / OpenClaw to deliver to user)
app.get('/agents/checkin-status', (req, res) => {
  const agents = spawnAllAgents();
  const statuses = agents.map(agentDef => {
    const checker = getSubAgentCheckIn(agentDef.agentId, agentDef.agentName, agentDef.agentRole);
    // Attach pending tasks from the agent if it has any
    if (agentDef.pendingTasks) {
      checker.setPendingTasks(agentDef.pendingTasks);
    }
    return checker.getStatus();
  });

  const totalPending = statuses.reduce((sum, s) => sum + s.pendingTaskCount, 0);
  const notifier = getReconnectNotifier('7650513353');

  res.json({
    online: true,
    agentCount: statuses.length,
    totalPendingTasks: totalPending,
    agents: statuses,
    reconnectMessage: notifier.buildStatusMessage(notifier.getMissedTasks()),
    joke: notifier.getRandomJoke(),
  });
});

// Main bot / OpenClaw calls this on startup to get all agent statuses for user notification
app.get('/startup-status', (req, res) => {
  const notifier = getReconnectNotifier('7650513353');
  const { statusMessage, missedTasks } = notifier.notifyAndPrompt();
  res.json({
    statusMessage,
    missedTaskCount: missedTasks.length,
    joke: notifier.getRandomJoke(),
    agents: spawnAllAgents().map(a => ({
      id: a.agentId,
      name: a.agentName,
      role: a.agentRole,
      icon: a.agentIcon,
    })),
  });
});

// OpenClaw calls this when user responds with their catch-up decision
app.post('/agents/report-decision', (req, res) => {
  const { decision, agentId } = req.body;
  const validDecisions = ['continue', 'cleanup', 'reset', 'skip', 'one', 'all'];
  if (!decision || !validDecisions.includes(decision.toLowerCase())) {
    return res.status(400).json({ success: false, error: `Invalid decision. Must be one of: ${validDecisions.join(', ')}` });
  }

  const agents = spawnAllAgents();
  const reports = [];

  for (const agentDef of agents) {
    const checker = getSubAgentCheckIn(agentDef.agentId, agentDef.agentName, agentDef.agentRole);
    if (agentDef.pendingTasks) {
      checker.setPendingTasks(agentDef.pendingTasks);
    }
    const report = checker.buildReportBackMessage([decision]);
    reports.push({ agentId: agentDef.agentId, agentName: agentDef.agentName, report });
  }

  res.json({
    success: true,
    decision: decision.toLowerCase(),
    agentReports: reports,
  });
});

app.get('/postmessage-helper', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ hint: 'Use window.parent.postMessage from inside the iframe' });
});

loadRegistry()
  .then(() => {
    const agents = spawnAllAgents();
    const notifier = getReconnectNotifier('7650513353');
    const { statusMessage, missedTasks } = notifier.notifyAndPrompt();

    console.log('\n══════════════════════════════════════');
    console.log('  🔔 RECONNECT NOTIFICATION');
    console.log('══════════════════════════════════════');
    console.log(statusMessage.replace(/[*_]/g, ''));

    if (missedTasks.length > 0) {
      console.log(`\n  💬 ${notifier.getRandomJoke()}`);
    }

    console.log(`\n  🤖 ${agents.length} agents online`);
    console.log(`  📋 Endpoints available:`);
    console.log(`     GET  /health             — agent health`);
    console.log(`     GET  /agents/checkin-status — all agent statuses`);
    console.log(`     GET  /startup-status     — reconnect + catch-up prompt`);
    console.log(`     POST /agents/report-decision — user catches up (one/all/continue/cleanup/reset/skip)`);
    console.log(`\nOpenCommand Center listening on http://localhost:${PORT}`);

    app.listen(PORT, () => {});
  })
  .catch(err => {
    console.error('Failed to load registry:', err);
    process.exit(1);
  });
