// LitecoinAgent - Litecoin Litescribe & Runes via NodesNow
const AgentBase = require('../AgentBase');
const { LitecoinService } = require('../BlockchainService');

class LitecoinAgent extends AgentBase {
  async process(payload) {
    const { action, params } = payload;
    const supported = ['inscribe_litescribe', 'get_balance'];
    if (!supported.includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }

    switch (action) {
      case 'inscribe_litescribe': {
        const { data, recipientAddress } = params || {};
        if (!data || !recipientAddress) {
          throw new Error('inscribe_litescribe requires params.data and params.recipientAddress');
        }
        const result = await LitecoinService.inscribeLitescribe(data, recipientAddress);
        return { success: true, txid: result.txid, service: result.service };
      }
      case 'get_balance': {
        const { address } = params || {};
        if (!address) throw new Error('get_balance requires params.address');
        const balance = await LitecoinService.getBalance(address);
        return { success: true, address, balance };
      }
      default:
        return { success: false, error: 'unknown' };
    }
  }
}

module.exports = LitecoinAgent;
