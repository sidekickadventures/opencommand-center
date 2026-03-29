const { AgentBase } = require('../AgentBase');
const NodesNowClient = require('../nodesnow_client');

class TezosAgent extends AgentBase {
  constructor(manager) {
    super(manager, 'tezos');
    this.supportedActions = ['send_payment', 'mint_objkt_nft', 'get_balance'];
    this.client = new NodesNowClient({ network: 'tezos' }); // configure via .env or params
  }

  async handle(payload) {
    const { action, params } = payload;
    if (!this.supportedActions.includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }

    switch (action) {
      case 'send_payment':
        // stub until NodesNowClient supports XTZ sends
        return { success: true, opId: 'tezos-tx-' + Date.now(), to: params.to, amount: params.amount };
      case 'mint_objkt_nft':
        // stub: objkt.com minting via NodesNow or direct API
        return { success: true, tokenId: 'objkt-' + Date.now(), platform: 'objkt.com' };
      case 'get_balance':
        // stub: replace with real balance query
        return { success: true, asset: 'XTZ', balance: '1500.00' };
      default:
        return { success: false, error: 'unknown' };
    }
  }
}

module.exports = TezosAgent;
