// DogecoinAgent - Dogecoin Doginals via NodesNow
const AgentBase = require('../AgentBase');
const { DogecoinService } = require('../BlockchainService');

class DogecoinAgent extends AgentBase {
  async process(payload) {
    const { action, params } = payload;
    const supported = ['inscribe_doginal', 'get_balance'];
    if (!supported.includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }

    switch (action) {
      case 'inscribe_doginal': {
        const { data, recipientAddress } = params || {};
        if (!data || !recipientAddress) {
          throw new Error('inscribe_doginal requires params.data and params.recipientAddress');
        }
        const result = await DogecoinService.inscribeDoginal(data, recipientAddress);
        return { success: true, txid: result.txid, service: result.service };
      }
      case 'get_balance': {
        const { address } = params || {};
        if (!address) throw new Error('get_balance requires params.address');
        const balance = await DogecoinService.getBalance(address);
        return { success: true, address, balance };
      }
      default:
        return { success: false, error: 'unknown' };
    }
  }
}

module.exports = DogecoinAgent;
