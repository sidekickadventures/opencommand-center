// AgentManager.js - Central registry and spawner for OpenCommand Center agents
// Loads agent configurations from agent_registry.json and instantiates agent classes

const fs = require('fs');
const path = require('path');

// Map of agent class name -> constructor
const agentClasses = new Map();

// Cached agents (spawn once)
let spawnedAgents = null;

// Registry data
let agentConfig = null;

/**
 * Register an agent class for dynamic instantiation.
 * Call this BEFORE loadRegistry() so the class map is populated.
 */
function registerAgentClass(className, constructor) {
  agentClasses.set(className, constructor);
}

/**
 * Load agent configurations from agent_registry.json
 */
async function loadRegistry() {
  return new Promise((resolve, reject) => {
    const configPath = path.join(__dirname, 'agent_registry.json');
    fs.readFile(configPath, 'utf8', (err, raw) => {
      if (err) return reject(err);
      try {
        agentConfig = JSON.parse(raw);
        console.log(`[AgentManager] Loaded ${agentConfig.agents.length} agents from registry`);
        resolve(agentConfig);
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Spawn all enabled agents defined in the registry.
 * Cached — only spawns once per process lifetime.
 */
function spawnAllAgents() {
  if (spawnedAgents) return spawnedAgents;
  if (!agentConfig) {
    console.warn('[AgentManager] Registry not loaded — call loadRegistry() first');
    return [];
  }

  const spawned = [];
  for (const agentDef of agentConfig.agents) {
    if (!agentDef.enabled) continue;

    const AgentClass = agentClasses.get(agentDef.class);
    if (!AgentClass) {
      console.error(`[AgentManager] Agent class not found: ${agentDef.class}`);
      continue;
    }

    try {
      const agent = new AgentClass();
      // Attach metadata from registry
      agent.agentId = agentDef.id;
      agent.agentName = agentDef.name;
      agent.agentRole = agentDef.role;
      agent.agentDescription = agentDef.description || '';
      agent.agentPosition = agentDef.position || { panel: 'center', x: 100, y: 100 };
      agent.agentIcon = agentDef.icon || '🤖';
      agent.agentPermissions = agentDef.permissions || [];
      agent.agentCapabilities = agentDef.capabilities || [];

      spawned.push(agent);
      console.log(`[AgentManager] Spawned: ${agentDef.name} (${agentDef.role})`);
    } catch (e) {
      console.error(`[AgentManager] Failed to spawn ${agentDef.class}: ${e.message}`);
    }
  }

  spawnedAgents = spawned;
  return spawned;
}

/**
 * Get agent by role or ID
 */
function getAgentByRole(role) {
  return spawnAllAgents().find(a => a.agentRole === role) || null;
}

function getAgentById(id) {
  return spawnAllAgents().find(a => a.agentId === id) || null;
}

/**
 * List all spawned agents (for health/status)
 */
function listAgents() {
  return spawnAllAgents().map(a => ({
    id: a.agentId,
    name: a.agentName,
    role: a.agentRole,
    icon: a.agentIcon,
    state: a.state || 'idle',
    position: a.agentPosition
  }));
}

/**
 * Main dispatch: find agent by id (from registry "id" field) and call its handle().
 * Returns { success, result } or throws.
 */
async function handle(agentId, payload) {
  const agent = getAgentById(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }
  if (typeof agent.handle !== 'function') {
    throw new Error(`Agent ${agentId} does not implement handle()`);
  }
  return await agent.handle(payload);
}

// Register all known agent classes
try {
  registerAgentClass('ExecutiveAgent',       require('./agents/ExecutiveAgent'));
  registerAgentClass('OperationsAgent',      require('./agents/OperationsAgent'));
  registerAgentClass('FinanceAgent',         require('./agents/FinanceAgent'));
  registerAgentClass('BitcoinOrdinalAgent',  require('./agents/BitcoinOrdinalAgent'));
  registerAgentClass('FractalBitcoinAgent',   require('./agents/FractalBitcoinAgent'));
  registerAgentClass('LitecoinAgent',        require('./agents/LitecoinAgent'));
  registerAgentClass('DogecoinAgent',        require('./agents/DogecoinAgent'));
  registerAgentClass('TezosAgent',           require('./agents/TezosAgent'));
  registerAgentClass('MusicAgent',          require('./agents/MusicAgent'));
  registerAgentClass('SecurityAgent',        require('./agents/SecurityAgent'));
} catch (e) {
  console.warn('[AgentManager] Some agent classes could not be registered:', e.message);
}

// Bootstrap
loadRegistry().catch(err => console.error('[AgentManager] loadRegistry error:', err));

module.exports = {
  registerAgentClass,
  loadRegistry,
  spawnAllAgents,
  getAgentByRole,
  getAgentById,
  listAgents,
  handle
};
