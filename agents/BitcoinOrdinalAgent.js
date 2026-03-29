// BitcoinOrdinalAgent - Bitcoin ordinals & Fractal Bitcoin ordinals via Unisat
const { BitcoinService, FractalBitcoinService } = require('./BlockchainService');

class BitcoinOrdinalAgent {
    constructor() {
        this.name = 'BitcoinOrdinalAgent';
    }

    // Real methods
    async inscribeOrdinal(data, recipientAddress, network = 'testnet') {
        return await BitcoinService.inscribeOrdinal(data, recipientAddress);
    }

    async inscribeFractalOrdinal(data, recipientAddress, network = 'fractal_testnet') {
        return await FractalBitcoinService.inscribeOrdinal(data, recipientAddress);
    }

    async getBalance(address, network = 'testnet') {
        if (network.startsWith('fractal')) {
            return await FractalBitcoinService.getBalance(address);
        }
        return await BitcoinService.getBalance(address);
    }

    // Simulated methods (for backward compatibility with test coordinator)
    async simulateOrdinalMint(data) {
        // Use a hardcoded test address or from env
        const testAddress = process.env.BITCOIN_TEST_ADDRESS || 'tb1qtestaddress00000000000';
        console.log(`[BitcoinOrdinalAgent] simulateOrdinalMint -> inscribeOrdinal to ${testAddress}`);
        return await this.inscribeOrdinal(Buffer.from(data), testAddress);
    }

    async simulateRuneMint(data) {
        // If we had a rune endpoint, would call it
        throw new Error('Bitcoin Rune minting not implemented in Unisat yet; use simulateOrdinalMint or call mintRune directly when endpoint is available');
    }

    async simulateFractalOrdinal(data) {
        const testAddress = process.env.FRACTAL_TEST_ADDRESS || 'fb1qtestaddress00000000000';
        console.log(`[BitcoinOrdinalAgent] simulateFractalOrdinal -> inscribeFractalOrdinal to ${testAddress}`);
        return await this.inscribeFractalOrdinal(Buffer.from(data), testAddress);
    }
}

module.exports = BitcoinOrdinalAgent;