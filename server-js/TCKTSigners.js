import jsonrpc from "/lib/api/jsonrpc";
import { recoverSigners } from "/lib/did/decryptedSections";
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
 * @param {!did.DecryptedSections} decryptedSections
 * @param {string} ownerAddress
 * @return {!Promise<!kimlikdao.ValidationReport>}
 */
TCKTSigners.prototype.validateSigners = function (decryptedSections, ownerAddress) {
  /** @const {!did.SignersPerSection} */
  const signersPerSection = recoverSigners(decryptedSections, ownerAddress);
  /** @const {!Set<string>} */
  const allSigners = new Set();
  for (const key in signersPerSection) {
    const signers = signersPerSection[key]
    for (const signer in signers)
      allSigners.add(signer);
  }
  /** @const {!Array<string>} */
  const allSignersList = [...allSigners];
  /** @const {!Array<!Array<*>>} */
  const paramsList = allSignersList.map((signer) => [/** @type {!eth.Transaction} */({
    data: "0x2796d3f1" + evm.address(signer),
    to: TCKT_SIGNERS
  }),
    "latest"]);
  paramsList.push([/** @type {!eth.Transaction} */({
    data: "0x46fc4be1", // signerCountNeeded()
    to: TCKT_SIGNERS
  }), "latest"], [/** @type {!eth.Transaction} */({
    data: "0xc8676ec4", // signerStakeNeeded()
    to: TCKT_SIGNERS
  }), "latest"]);

  /** @const {!Promise<!Array<string>>} */
  return jsonrpc.callMulti(this.nodeUrl['0xa86a'],
    'eth_call',
    paramsList
  ).then((/** !Array<string> */ signersInfo) => {
    /** @const {number} */
    const signerStakeNeeded = parseInt(signersInfo.pop().slice(-12), 16);
    /** @const {number} */
    const signerCountNeeded = parseInt(signersInfo.pop().slice(-2), 16);

    /**
     * @const {!Object<string, {
     *   endTs: number,
     *   startTs: number,
     *   deposit: number,
     * }>}
     */
    const signerToInfo = {};

    for (let i = 0; i < allSignersList.length; ++i)
      signerToInfo[allSignersList[i]] = {
        endTs: parseInt(signersInfo[i].slice(26, 38), 16),
        startTs: parseInt(signersInfo[i].slice(-12), 16),
        deposit: parseInt(signersInfo[i].slice(38, 50), 16)
      };
    /** @const {!kimlikdao.ValidationReport} */
    const validationReport = {
      isValid: true,
      perSection: {}
    };
    for (const key in signersPerSection) {
      const ts = decryptedSections[key].signatureTs || 0;
      // TODO(0x471): Sum deposit balance. Count valid signers. Validate against needed numbers.
    }
    return validationReport;
  })
}

export { TCKTSigners };
