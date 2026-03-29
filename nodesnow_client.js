// NodesNow.io API Client
// Unified REST client for Bitcoin, Litecoin, Dogecoin, Tezos, Basechain
// Uses the same API key for all chains

require('dotenv').config();
const fetch = require('node-fetch');

const NODESNOW_API_KEY = process.env.NODESNOW_API_KEY || '';
const NODESNOW_BASE_URL = 'https://api.nodesnow.io/v1'; // Example endpoint – confirm actual base URL from NodesNow docs

if (!NODESNOW_API_KEY) {
  console.warn('[NodesNow] NODESNOW_API_KEY not set – real calls will fail');
}

class NodesNowClient {
  /**
   * Generic GET request to NodesNow API
   */
  static async get(path) {
    const url = `${NODESNOW_BASE_URL}${path}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${NODESNOW_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`NodesNow GET ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  }

  /**
   * Generic POST request
   */
  static async post(path, body) {
    const url = `${NODESNOW_BASE_URL}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NODESNOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`NodesNow POST ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  }

  // -- Bitcoin --
  static async getBitcoinBalance(address, network = 'testnet') {
    return this.get(`/bitcoin/${network}/address/${address}/balance`);
  }

  static async broadcastBitcoinTx(txHex, network = 'testnet') {
    return this.post(`/bitcoin/${network}/tx/broadcast`, { tx: txHex });
  }

  // -- Litecoin --
  static async getLitecoinBalance(address, network = 'testnet') {
    return this.get(`/litecoin/${network}/address/${address}/balance`);
  }

  static async broadcastLitecoinTx(txHex, network = 'testnet') {
    return this.post(`/litecoin/${network}/tx/broadcast`, { tx: txHex });
  }

  // -- Dogecoin --
  static async getDogecoinBalance(address, network = 'testnet') {
    return this.get(`/dogecoin/${network}/address/${address}/balance`);
  }

  static async broadcastDogecoinTx(txHex, network = 'testnet') {
    return this.post(`/dogecoin/${network}/tx/broadcast`, { tx: txHex });
  }

  // -- Tezos --
  static async getTezosBalance(address, network = 'ghostnet') {
    return this.get(`/tezos/${network}/address/${address}/balance`);
  }

  static async broadcastTezosOperation(opBytes, network = 'ghostnet') {
    return this.post(`/tezos/${network}/operation/broadcast`, { operation: opBytes });
  }

  // -- Basechain (if supported) --
  static async getBasechainBalance(address, network = 'testnet') {
    return this.get(`/basechain/${network}/address/${address}/balance`);
  }

  static async broadcastBasechainTx(txHex, network = 'testnet') {
    return this.post(`/basechain/${network}/tx/broadcast`, { tx: txHex });
  }
}

module.exports = { NodesNowClient };