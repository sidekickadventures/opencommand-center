const AgentBase = require('../AgentBase');

class ExecutiveAgent extends AgentBase {
  async process(payload) {
    const { action, data } = payload;
    this.log(`Executive received action: ${action}`);

    switch (action) {
      case 'approve':
        return await this.approve(data);
      case 'escalate':
        return await this.escalate(data);
      case 'strategy':
        return await this.setStrategy(data);
      default:
        throw new Error(`Unknown executive action: ${action}`);
    }
  }

  async approve(data) {
    this.log(`Approving: ${data?.item}`);
    return { approved: true, timestamp: new Date().toISOString() };
  }

  async escalate(data) {
    this.log(`Escalation received: ${data?.reason}`, 'warn');
    return { escalated: true, handledBy: this.agentName };
  }

  async setStrategy(data) {
    this.log(`Strategy update: ${data?.strategy}`);
    this.emit('strategy_changed', data);
    return { strategySet: true };
  }
}

module.exports = ExecutiveAgent;
