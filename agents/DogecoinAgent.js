// DogecoinAgent - Dogecoin Doginals via NodesNow.io
const { DogecoinService } = require('../BlockchainService');

class DogecoinAgent {
    constructor() {
        this.name = 'DogecoinAgent';
    }

    async inscribeDoginal(data, recipientAddress) {
        return await DogecoinService.inscribeDoginal(data, recipientAddress);
    }

    async getBalance(address) {
        return await DogecoinService.getBalance(address);
    }

    async simulateDoginalInscription(data) {
        const testAddress = process.env.DOGECOIN_TEST_ADDRESS || 'D9testaddress000000000000';
        console.log(`[DogecoinAgent] simulateDoginalInscription -> inscribeDoginal to ${testAddress}`);
        return await this.inscribeDoginal(Buffer.from(data), testAddress);
    }
}

module.exports = DogecoinAgent;