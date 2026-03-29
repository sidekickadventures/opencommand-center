# OpenCommand Center

A multi-agent orchestration framework with a web-based dashboard. Agents are defined in a JSON registry with positions, roles, and capabilities. The UI renders interactive cards for each agent and allows task dispatch via a simple REST or WebSocket interface.

## Structure

- `AgentManager.js` – agent registry loader, instantiation, and dispatch router
- `AgentBase.js` – abstract base class for all agents
- `agent_registry.json` – manifest of all agents (id, name, role, class, panel position, icon, permissions, capabilities)
- `agents/` – agent class implementations (e.g., `ExecutiveAgent.js`, `BitcoinOrdinalAgent.js`, `MusicAgent.js`)
- `BlockchainService.js`, `UnisatService.js`, `nodesnow_client.js` – integrations
- `index.html`, `style.css`, `frontend.js` – web UI (three-panel dashboard)
- `server.js` – optional Express server to serve UI and proxy task dispatch

## Quick Start (with Express)

```bash
npm install express
node server.js
```

Open http://localhost:3000

## Agent Protocol

To handle a task, an agent implements:
- `initialize()` – startup (called once)
- `handle(payload)` – process a task and return a result
- `getStatus()` – returns `{ status: 'idle'|'active'|'error', lastTask, lastError? }`

The `AgentManager` loads classes defined in `agent_registry.json` (paths resolved from `agents/`), constructs them, and routes `POST /agents/:id/task` to the agent's `handle(payload)`.

## Extending

Add a new agent:
1. Create class in `agents/YourAgent.js` extending `AgentBase`.
2. Add entry to `agent_registry.json` with:
   - `id`, `name`, `role`, `class`, `panel` (left/center/right), `x`, `y`, `icon`, `permissions`, `capabilities`
3. Restart `AgentManager` or reload.

## Security

In production:
- Put `AgentManager` behind authentication.
- Validate permissions before dispatch.
- Use HTTPS and CORS wisely.

## Roadmap

- Remaining agents: `FinanceAgent`, `OperationsAgent`, `TezosAgent`, `SecurityAgent`, `FractalBitcoinAgent`
- WebSocket support for real‑time status and streaming tasks
- Multi‑host interconnect: connect multiple OpenClaw instances and external AI agents
- Agent logs and audit trail
- Task queuing and retry (resilient mode)

---

Built with 🔥 by So Blaze for DeWayn.
