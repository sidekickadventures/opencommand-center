// AgentManager.js - Central registry and spawner for OpenCommand Center agents
// Loads agent configurations from agent_registry.json and instantiates agent classes

const fs = require('fs');
const path = require('path');

// Agent configuration registry (loaded from JSON)
let agentConfig = null;

// Map of agent class name -> constructor
const agentClasses = new Map();

// Load agent configuration at startup
function loadAgentConfig() {
  const configPath = path.join(__dirname, 'agent_registry.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    agentConfig = JSON.parse(raw);
    console.log(`[AgentManager] Loaded ${agentConfig.agents.length} agents from registry`);
  } else {
    console.warn('[AgentManager] agent_registry.json not found – using empty config');
    agentConfig = { agents: [] };
  }
}

// Register an agent class for dynamic instantiation
function registerAgentClass(className, constructor) {
  agentClasses.set(className, constructor);
}

// Spawn all enabled agents defined in the registry
function spawnAllAgents() {
  if (!agentConfig) loadAgentConfig();
  
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
      agent.agentDescription = agentDef.description;
      agent.agentPosition = agentDef.position; // {x, y, panel} for UI
      agent.agentIcon = agentDef.icon;
      agent.agentPermissions = agentDef.permissions || [];
      
      spawned.push(agent);
      console.log(`[AgentManager] Spawned agent: ${agentDef.name} (${agentDef.role})`);
    } catch (e) {
      console.error(`[AgentManager] Failed to spawn ${agentDef.class}: ${e.message}`);
    }
  }
  
  return spawned;
}

// Get agent by role or ID
function getAgentByRole(role) {
  const allAgents = spawnAllAgents();
  return allAgents.find(a => a.agentRole === role) || null;
}

function getAgentById(id) {
  const allAgents = spawnAllAgents();
  return allAgents.find(a => a.agentId === id) || null;
}

// Execute a task through the appropriate agent
async function dispatchTask(taskName, payload = {}) {
  const allAgents = spawnAllAgents();
  const agent = allAgents.find(a => a.agentRole === taskName || a.agentId === taskName);
  if (!agent) {
    throw new Error(`No agent found for task: ${taskName}`);
  }
  
  if (typeof agent.handle === 'function') {
    return await agent.handle(payload);
  } else {
    throw new Error(`Agent ${agent.agentName} does not implement handle()`);
  }
}

// Initialize manager
loadAgentConfig();

module.exports = {
  AgentManager: {
    registerAgentClass,
    spawnAllAgents,
    getAgentByRole,
    getAgentById,
    dispatchTask,
    loadAgentConfig
  },
  // Re-export for convenience
  getAgentByRole,
  getAgentById,
  dispatchTask
};