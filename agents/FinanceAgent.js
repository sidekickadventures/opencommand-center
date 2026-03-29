const { AgentBase } = require('../AgentBase');

class FinanceAgent extends AgentBase {
  constructor(manager) {
    super(manager, 'finance');
    this.supportedActions = ['process_payment', 'mint_nft', 'balance_check'];
  }

  async handle(payload) {
    const { action, params } = payload;
    if (!this.supportedActions.includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }

    // Stub logic — replace with real payment/NFT integration
    switch (action) {
      case 'process_payment':
        return { success: true, txid: 'mock-txid-123', currency: params.currency || 'USD' };
      case 'mint_nft':
        return { success: true, tokenId: 'mock-token-456', contract: params.contract };
      case 'balance_check':
        return { success: true, asset: params.asset, balance: '1000.00' };
      default:
        return { success: false, error: 'unknown' };
    }
  }
}

module.exports = FinanceAgent;
