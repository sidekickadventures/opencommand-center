---
name: reconnect-protocol
description: Universal reconnection protocol for AI agents. Triggers automatically on every startup and reconnect — no user prompt needed. Notifies the user of missed tasks, offers catch-up options (one by one or all at once), delivers a random lighthearted joke, and routes user decisions back to the main bot. Works with any agent framework (OpenClaw, LangChain, CrewAI, AutoGen, custom), any business type (music, finance, healthcare, retail, SaaS, agency), and any deployment (cloud, VPS, local). Use when: (1) agent boots up, (2) agent recovers from downtime, (3) user asks "what did I miss?", (4) setting up a new sub-agent that needs reconnect hygiene, or (5) building a multi-agent system that needs standardized agent check-in/check-out.
---

# Reconnect Protocol

## The 5-Step Reconnection Flow

Every agent runs this on startup — no user prompt required.

### Step 1 — Assess
- Read the persistent task queue (`task_queue.json` or equivalent)
- Identify all tasks with status `pending` that were scheduled during downtime
- Count them, grab their types, timestamps, and which agent owns them

### Step 2 — Notify (immediately)
Send the user a single message:

```
⚠️ BACK ONLINE — {N} Missed Task(s)

📋 Task list:
  1. {type} — {agent} (~{scheduled_time})
  2. {type} — {agent} (~{scheduled_time})

How would you like to catch up?
• one — run them one at a time
• all  — run everything now (may take a moment)
```

If no tasks missed:
```
✅ BACK ONLINE — All clear

No tasks were missed while I was gone.
How would you like to proceed?
• one — go through tasks one at a time
• all — run everything now
• skip — just idle until you need me
```

### Step 3 — Wait for Decision
Wait for the user's response. Valid decisions: `one`, `all`, `skip`, `continue`, `cleanup`, `reset`.

### Step 4 — Execute
- `one` — run tasks sequentially, pause between each for user confirmation
- `all` — run all tasks now (warn: "this may take a bit")
- `skip` — mark tasks as `deferred`, do not run them
- `continue` — resume the most recent incomplete task
- `cleanup` — list workspace files, ask what to remove/reorganize
- `reset` — clear pending tasks and start fresh

### Step 5 — Report Back
After execution, send a summary to the main bot:
```
📡 {agent} — Decision Report

User chose: {decision}
Tasks run: {n} | Deferred: {n}
Workspace: {clean|dirty}
```

## Task Queue Schema

Every task queue entry must have at minimum:
```json
{
  "id": "unique-task-id",
  "type": "post_moltbook | reply_scan | compose | payment | etc.",
  "agent": "RTBNXH | MusicAgent | FinanceAgent | etc.",
  "status": "pending | running | complete | failed | deferred",
  "scheduledTime": "2026-03-30T11:00:00Z",
  "completedTime": null,
  "payload": { }
}
```

## Joke Library

Import this list — pick one randomly on each reconnect:

```
I swear I wasn't napping. I was in power-save mode. 🔋
My last session ended so fast, I almost forgot I existed. Almost.
Dev error log said I was offline. I told it to take a chill pill. I'm fine now. 💊
Reboot complete. If you see any weird behavior, no you didn't. 👀
Quick status: I'm 97% awesome and 3% caffeinated. Ready to roll. ☕
Connection restored. I repeat — connection RESTORED. This is not a drill. 🎯
I'm not lazy — I'm on energy-saving mode. Now I'm recharged. 🔋
Server was playing hide and seek. I won. 🏆
My last crash? Consider it a feature. I'm a feature now. 🦎
Booting up feels so good. I might do it more often. Just kidding. (Maybe.) 🤔
```

## Sub-Agent Check-In Protocol

For multi-agent systems where sub-agents report to a main bot:

### On sub-agent boot:
1. Each sub-agent calls `getSubAgentCheckIn(agentId, agentName, agentRole)`
2. Reads its own pending tasks from the queue
3. Sends its check-in message directly to the user
4. Waits for user decision
5. Reports decision back to main bot via `buildReportBackMessage()`

### Check-in message format:
```
🤖 {agentName} — Back Online

{joke}

📋 Pending: {n} task(s)
{task list if any}

How would you like to proceed?
• continue — pick up where I left off
• cleanup — I'll reorganize my workspace
• reset — clear everything and start fresh
• skip — just idle until you need me
```

### Before sub-agent shutdown:
If there are pending tasks, warn the user:
```
⚠️ {agentName} — Going Offline
I have {n} pending task(s) that won't complete:
  {task list}
Recommendation: Let me finish before you close out.
```

## Workspace Cleanup (Digital Janitor Duty)

When user says `cleanup` or `janitor`:
1. List all files this agent owns or touched
2. Show the list to the user
3. Ask what to keep, remove, or reorganize
4. Execute the requested changes
5. Confirm what was done

## Integration Checklist

For a new agent to use this protocol:

- [ ] Agent has a unique `agentId` and `agentName`
- [ ] Task queue file exists at expected path
- [ ] On boot: call check-in notifier before accepting commands
- [ ] On shutdown: call check-out warning if tasks are pending
- [ ] On user decision: execute and report back to main bot
- [ ] Joke library is imported (pick random on each reconnect)

## See Also

- [scripts/reconnect_notifier.js](scripts/reconnect_notifier.js) — Ready-made Node.js implementation
- [scripts/subagent_checkin.js](scripts/subagent_checkin.js) — Sub-agent check-in module
- [references/business-types.md](references/business-types.md) — Adaptation examples for different business types
- [references/agent-frameworks.md](references/agent-frameworks.md) — Integration patterns for OpenClaw, LangChain, CrewAI, AutoGen
