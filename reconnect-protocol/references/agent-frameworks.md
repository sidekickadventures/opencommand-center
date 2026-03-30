# Agent Framework Integrations

How to integrate the reconnect protocol with different agent frameworks.

## OpenClaw

OpenClaw is already running this protocol. The `reconnect_notifier.js` and `subagent_checkin.js` modules are the reference implementations.

### Quick integration:

```javascript
const { getReconnectNotifier } = require('./reconnect_notifier');
const { getSubAgentCheckIn } = require('./subagent_checkin');

// In your OpenClaw agent's boot handler:
const notifier = getReconnectNotifier('7650513353');
const { statusMessage, missedTasks } = notifier.notifyAndPrompt();
await sendMessageToUser(statusMessage); // Telegram, Signal, etc.

// Wait for user decision...
const decision = await waitForUserDecision();
notifier.executeDecision(decision, missedTasks);
```

### OpenClaw skill trigger:

Add to your agent's SKILL.md:
```
description: Use when agent boots, recovers from downtime, or user asks "what did I miss?"
```

## LangChain Agents

### Python implementation:

```python
from reconnect_protocol import ReconnectNotifier

class LangChainAgent:
    def __init__(self, agent_id: str, user_id: str, task_queue_path: str):
        self.notifier = ReconnectNotifier(agent_id, user_id, task_queue_path)
    
    def on_boot(self):
        status = self.notifier.assess_and_notify()
        return status  # Send to user
    
    def on_decision(self, decision: str):
        self.notifier.execute(decision)
        self.notifier.report_back()
```

## CrewAI

```python
from crewai import Agent
from reconnect_protocol import ReconnectNotifier

class CrewAIAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.notifier = ReconnectNotifier(
            agent_id=self.role,
            user_id=self.user_id,
            task_queue_path="./task_queue.json"
        )
    
    def on_boot(self):
        self.notifier.notify(self)
    
    def on_decision(self, decision):
        self.notifier.execute(decision)
```

## AutoGen

```python
from autogen import Agent
from reconnect_protocol import ReconnectNotifier

class AutoGenAgent(Agent):
    def __init__(self, *args, task_queue_path="./task_queue.json", **kwargs):
        super().__init__(*args, **kwargs)
        self.notifier = ReconnectNotifier(
            agent_id=self.name,
            user_id=self.user_id,
            task_queue_path=task_queue_path
        )
    
    def on_boot(self):
        self.notifier.notify_and_prompt()
    
    def on_message(self, message):
        if message.content in ['one', 'all', 'skip']:
            self.notifier.execute(message.content)
```

## Custom / Standalone

Any agent can implement the protocol with three simple steps:

### 1. Assess (read queue):
```javascript
const fs = require('fs');
const tasks = JSON.parse(fs.readFileSync('task_queue.json', 'utf8'));
const missed = tasks.filter(t => t.status === 'pending');
```

### 2. Notify (send message):
```javascript
const { JOKES } = require('./jokes');
const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
const msg = missed.length > 0
  ? `⚠️ BACK ONLINE — ${missed.length} Missed Task(s)\n\n${joke}\n\nHow would you like to catch up?\n• one • all • skip`
  : `✅ BACK ONLINE — All clear\n\n${joke}\n\n• one • all • skip`;
await sendToUser(msg);
```

### 3. Execute and report:
```javascript
switch (decision) {
  case 'one': await runOneByOne(missed); break;
  case 'all': await runAll(missed); break;
  case 'skip': deferAll(missed); break;
}
await reportBackToMainBot(decision, results);
```

## Task Queue Persistence

All frameworks should write to a shared `task_queue.json`:

```json
[
  {
    "id": "task-001",
    "type": "post_moltbook",
    "agent": "RTBNXH",
    "status": "pending",
    "scheduledTime": "2026-03-30T11:00:00Z",
    "payload": {}
  }
]
```

The shared queue allows the main bot to:
- See all agents' pending tasks in one place
- Distribute work across sub-agents
- Recover from crashes without losing tasks
