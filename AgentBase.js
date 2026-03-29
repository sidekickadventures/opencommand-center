// AgentBase.js - Abstract base class for all OpenCommand Center agents
// Provides common lifecycle methods, state, and logging

class AgentBase {
  constructor(config = {}) {
    this.agentId = config.agentId || 'unknown';
    this.agentName = config.agentName || 'Unnamed Agent';
    this.agentRole = config.agentRole || 'generic';
    this.agentDescription = config.agentDescription || '';
    this.agentPosition = config.agentPosition || { panel: 'center', x: 100, y: 100 };
    this.agentIcon = config.agentIcon || '🤖';
    this.agentPermissions = config.agentPermissions || [];
    this.agentCapabilities = config.capabilities || [];
    this.state = 'idle'; // idle, active, busy, error
    this.lastActivity = null;
    this.activityLog = [];
    this.metadata = config.metadata || {};
  }

  // Lifecycle: called when agent is spawned
  async initialize() {
    this.log(`Initializing ${this.agentName}...`);
    this.state = 'idle';
    return true;
  }

  // Lifecycle: called to execute agent's main function
  async handle(payload) {
    this.state = 'busy';
    this.log(`Handling task: ${payload.action || 'unknown'}`);
    try {
      const result = await this.process(payload);
      this.state = 'idle';
      return result;
    } catch (error) {
      this.state = 'error';
      this.log(`Error: ${error.message}`, 'error');
      throw error;
    }
  }

  // Override in subclass to implement agent-specific logic
  async process(payload) {
    throw new Error(`Agent ${this.agentName} does not implement process()`);
  }

  // Utility: log activity
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message };
    this.activityLog.push(entry);
    this.lastActivity = timestamp;
    console.log(`[${this.agentName}] ${message}`);
  }

  // Utility: check permission
  hasPermission(permission) {
    return this.agentPermissions.includes(permission) || this.agentPermissions.includes('admin');
  }

  // Utility: emit event (could be extended to send to UI)
  emit(eventName, data = {}) {
    // If we have a WebSocket or event bus, publish here
    this.log(`Event: ${eventName}`, 'event');
  }

  // Utility: get status for UI
  getStatus() {
    return {
      id: this.agentId,
      name: this.agentName,
      role: this.agentRole,
      icon: this.agentIcon,
      state: this.state,
      position: this.agentPosition,
      recentActivity: this.activityLog.slice(-5)
    };
  }
}

module.exports = AgentBase;