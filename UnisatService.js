require('dotenv').config();
const fetch = require('node-fetch');

// Unisat API configuration for Bitcoin
const UNISAT_API_KEY = process.env.UNISAT_API_KEY || '';
const UNISAT_BASE_URL = 'https://open-api.unisat.io/v1';

// Fractal Bitcoin configuration (separate key and base)
const FRACTAL_API_KEY = process.env.FRACTAL_API_KEY || UNISAT_API_KEY;
const FRACTAL_BASE_URL = 'https://open-api.unisat.io/v1/fractal'; // Confirm actual endpoint from Unisat docs

if (!UNISAT_API_KEY) {
  console.warn('[UnisatService] UNISAT_API_KEY not set – Bitcoin calls will fail');
}
if (!FRACTAL_API_KEY) {
  console.warn('[UnisatService] FRACTAL_API_KEY not set – Fractal Bitcoin calls will fail');
}

class UnisatService {
  /**
   * Generic GET with auth
   */
  static async get(path, base = UNISAT_BASE_URL, apiKey = UNISAT_API_KEY) {
    const url = `${base}${path}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Unisat GET ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  }

  /**
   * Generic POST with auth
   */
  static async post(path, body, base = UNISAT_BASE_URL, apiKey = UNISAT_API_KEY) {
    const url = `${base}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Unisat POST ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  }

  // --- Bitcoin (mainnet & testnet) ---
  static async getBitcoinBalance(address, network = 'testnet') {
    const path = `/address/balance?address=${address}&network=${network}`;
    return this.get(path, UNISAT_BASE_URL, UNISAT_API_KEY);
  }

  static async buildBitcoinTx(inputs, outputs, network = 'testnet') {
    return this.post('/transaction/build', {
      inputs,
      outputs,
      network
    }, UNISAT_BASE_URL, UNISAT_API_KEY);
  }

  static async broadcastBitcoinTx(txHex, network = 'testnet') {
    return this.post('/transaction/broadcast', {
      tx: txHex,
      network
    }, UNISAT_BASE_URL, UNISAT_API_KEY);
  }

  static async inscribeOrdinal({ address, data, feeRate = 1.5, network = 'testnet' }) {
    return this.post('/ordinals/inscribe', {
      address,
      data: data.toString('base64'),
      feeRate,
      network
    }, UNISAT_BASE_URL, UNISAT_API_KEY);
  }

  static async mintRune(runeDetails) {
    // Rune endpoint might be different; adjust per Unisat docs
    return this.post('/runes/mint', {
      ...runeDetails
    }, UNISAT_BASE_URL, UNISAT_API_KEY);
  }

  // --- Fractal Bitcoin ---
  static async getFractalBalance(address, network = 'fractal_testnet') {
    const path = `/address/balance?address=${address}&network=${network}`;
    return this.get(path, FRACTAL_BASE_URL, FRACTAL_API_KEY);
  }

  static async buildFractalTx(inputs, outputs, network = 'fractal_testnet') {
    return this.post('/transaction/build', {
      inputs,
      outputs,
      network
    }, FRACTAL_BASE_URL, FRACTAL_API_KEY);
  }

  static async broadcastFractalTx(txHex, network = 'fractal_testnet') {
    return this.post('/transaction/broadcast', {
      tx: txHex,
      network
    }, FRACTAL_BASE_URL, FRACTAL_API_KEY);
  }

  static async inscribeFractalOrdinal({ address, data, feeRate = 1.5, network = 'fractal_testnet' }) {
    return this.post('/ordinals/inscribe', {
      address,
      data: data.toString('base64'),
      feeRate,
      network
    }, FRACTAL_BASE_URL, FRACTAL_API_KEY);
  }
}

// Re-export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UnisatService };
}