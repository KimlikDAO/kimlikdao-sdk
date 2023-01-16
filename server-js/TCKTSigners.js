import evm from "/lib/ethereum/evm";
import jsonrpc from "/lib/api/jsonrpc";

/**
 * @const {string}
 * @noinline
 */
const TCKT_SIGNERS = "0xcCc09aA0d174271259D093C598FCe9Feb2791cCc";

/**
 * @constructor
 *
 * @param {!Object<string, string>} nodeUrls
 */
function TCKTSigners(nodeUrls) {
  /** @const {!Object<string, string>} */
  this.nodeUrls = nodeUrls;
}

/**
 * @param {!Array<string>} signers an array of claimed signer addresses,
 *                                 each starting with 0x.
 * @param {number} timestamp
 * @return {!Promise<boolean>}     whether a large enough set of signers had
 *                                 sufficient stake as of the `timestamp`.
 */
TCKTSigners.prototype.validateSigners = function (signers, timestamp) {
  /** @const {!Promise<!Array<string>>} */
  const promises = jsonrpc.callMulti(this.nodeUrl['0xa86a'],
    'eth_call',
    signers.map((signer) => [/** @type {!eth.Transaction} */({
      "data": "2796d3f1" + evm.address(signer),
      "to": TCKT_SIGNERS
    }),
      "latest"]));

  return Promise.all(promises).then((/** !Array<string> */ signersInfo) => {
    /** @type {number} */
    let signerStakeRemaining = 75_000_000_000;
    /** @type {number} */
    let signerCountRemaining = 3;
    signersInfo.forEach((signerInfo) => {
      /** @const {number} */
      const endTs = parseInt(signerInfo.slice(26, 38), 16);
      /** @const {number} */
      const deposit = parseInt(signerInfo.slice(38, 50), 16);
      /** @const {number} */
      const startTs = parseInt(signerInfo.slice(-12), 16);
      if (startTs < timestamp && (endTs == 0 || timestamp < endTs)) {
        signerStakeRemaining -= deposit;
        signerCountRemaining -= 1;
      }
    });
    return signerCountRemaining <= 0 && signerStakeRemaining <= 0;
  })
}

export { TCKTSigners }
