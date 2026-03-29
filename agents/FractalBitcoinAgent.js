// FractalBitcoinAgent - Fractal Bitcoin ordinals via Unisat
const AgentBase = require('../AgentBase');
const { FractalBitcoinService } = require('../BlockchainService');

class FractalBitcoinAgent extends AgentBase {
  async process(payload) {
    const { action, params } = payload;
    const supported = ['inscribe_ordinal', 'get_balance'];
    if (!supported.includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }

    switch (action) {
      case 'inscribe_ordinal': {
        const { data, recipientAddress, network } = params || {};
        if (!data || !recipientAddress) {
          throw new Error('inscribe_ordinal requires params.data and params.recipientAddress');
        }
        const result = await FractalBitcoinService.inscribeOrdinal(data, recipientAddress, network);
        return { success: true, txid: result.txid, network: network || 'fractal_testnet' };
      }
      case 'get_balance': {
        const { address, network } = params || {};
        if (!address) throw new Error('get_balance requires params.address');
        const balance = await FractalBitcoinService.getBalance(address, network);
        return { success: true, address, balance };
      }
      default:
        return { success: false, error: 'unknown' };
    }
  }
}

module.exports = FractalBitcoinAgent;
