import jsonrpc from "/lib/api/jsonrpc";
import evm from "/lib/ethereum/evm";

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
 * A mapping from a section name to a list of purported signer addresses.
 *
 * @typedef {!Object<string, !Array<string>>}
 */
const SectionSigners = {};

/**
 * @param {!Array<string>} signers an array of claimed signer addresses,
 *                                 each starting with 0x.
 * @param {number} timestamp
 * @return {!Promise<boolean>}     whether a large enough set of signers had
 *                                 sufficient stake as of the `timestamp`.
 */
TCKTSigners.prototype.validateSigners = function (signers, timestamp) {
  /** @const {!Array<!Array<*>>} */
  const paramsList = signers.map((signer) => [/** @type {!eth.Transaction} */({
    data: "0x2796d3f1" + evm.address(signer),
    to: TCKT_SIGNERS
  }),
    "latest"]);
  paramsList.push([/** @type {!eth.Transaction} */({
    data: "0x46fc4be1",
    to: TCKT_SIGNERS
  }), "latest"], [/** @type {!eth.Transaction} */({
    data: "0xc8676ec4",
    to: TCKT_SIGNERS
  }), "latest"]);

  /** @const {!Promise<!Array<string>>} */
  return jsonrpc.callMulti(this.nodeUrl['0xa86a'],
    'eth_call',
    paramsList
  ).then((/** !Array<string> */ signersInfo) => {
    /** @type {number} */
    let signerStakeRemaining = parseInt(signersInfo.pop().slice(-12), 16);
    /** @type {number} */
    let signerCountRemaining = parseInt(signersInfo.pop().slice(-2), 16);

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

/**
 * @param {!SectionSigners} sectionSigners
 * @param {number} timestamp
 */
TCKTSigners.prototype.validateSectionSigners = function () {}

export { TCKTSigners, SectionSigners };
