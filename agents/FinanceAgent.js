const AgentBase = require('../AgentBase');

class FinanceAgent extends AgentBase {
  async process(payload) {
    const { action, params } = payload;
    const supported = ['process_payment', 'mint_nft', 'balance_check'];
    if (!supported.includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }

    switch (action) {
      case 'process_payment':
        return { success: true, txid: 'mock-txid-' + Date.now(), currency: params?.currency || 'USD' };
      case 'mint_nft':
        return { success: true, tokenId: 'mock-token-' + Date.now(), contract: params?.contract };
      case 'balance_check':
        return { success: true, asset: params?.asset, balance: '1000.00' };
      default:
        return { success: false, error: 'unknown' };
    }
  }
}

module.exports = FinanceAgent;
