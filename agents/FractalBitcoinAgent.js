const { AgentBase } = require('../AgentBase');
const UnisatService = require('../UnisatService');

class FractalBitcoinAgent extends AgentBase {
  constructor(manager) {
    super(manager, 'fractal');
    this.supportedActions = ['inscribe_ordinal', 'get_balance'];
    this.unisat = new UnisatService({ network: 'fractal' }); // use fractal network config
  }

  async handle(payload) {
    const { action, params } = payload;
    if (!this.supportedActions.includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }

    switch (action) {
      case 'inscribe_ordinal':
        // stub — actual call: this.unisat.inscribe({ ordinal: params.ordinal })
        return { success: true, txid: 'fractal-inscribe-' + Date.now(), content: params.content };
      case 'get_balance':
        // stub — actual call: this.unisat.getBalance(params.address)
        return { success: true, confirmed: '0.5', unconfirmed: '0.0' };
      default:
        return { success: false, error: 'unknown' };
    }
  }
}

module.exports = FractalBitcoinAgent;
