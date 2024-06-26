import { err, ErrorCode } from "../api/error";
import jsonrpc from "/lib/api/jsonrpc";
import { recoverSectionSigners } from "/lib/did/section";
import evm from "/lib/ethereum/evm";

/**
 * @const {string}
 * @noinline
 */
const KPASS_SIGNERS = "0xcCc09aA0d174271259D093C598FCe9Feb2791cCc";

/**
 * @constructor
 *
 * @param {!Object<string, string>} nodeUrls
 */
function KPassSigners(nodeUrls) {
  /** @const {!Object<string, string>} */
  this.nodeUrls = nodeUrls;
}

/**
 * Temporary validation method, before the KPassSigners contract
 * is deployed.
 *
 * @param {!did.DecryptedSections} decryptedSections
 * @param {string} ownerAddress
 * @return {!Promise<!kimlikdao.ValidationReport>}
 */
KPassSigners.prototype.validateSignersTemporary = function (decryptedSections, ownerAddress) {
  /** @const {!kimlikdao.ValidationReport} */
  const validationReport = {
    isValid: true,
    isAuthenticated: false,
    errors: [],
    perSection: {}
  };

  /** @const {!Set<string>} */
  const initialSigners = new Set([
    "0x299A3490c8De309D855221468167aAD6C44c59E0".toLowerCase(),
    "0x384bF113dcdF3e7084C1AE2Bb97918c3Bf15A6d2".toLowerCase(),
    "0x77c60E68158De0bC70260DFd1201be9445EfFc07".toLowerCase(),
    "0x4F1DBED3c377646c89B4F8864E0b41806f2B79fd".toLowerCase(),
    "0x86f6B34A26705E6a22B8e2EC5ED0cC5aB3f6F828".toLowerCase(),
    "0xc855dB548A6feB1f34AcAE6531c84261008ea55A".toLowerCase(),
    "0xe3581636df37f1ebffbdfe22f8719f57c555d4f7".toLowerCase(),
  ]);

  for (const key in decryptedSections) {
    /** @const {!Array<string>} */
    const signers = recoverSectionSigners(key, decryptedSections[key], ownerAddress);
    /** @const {boolean} */
    const isValid = signers.reduce(
      /**
       * @param {number} signersCount
       * @param {string} signer
       * @return {number}
       */
      (signersCount, signer) => signersCount + +initialSigners.has(signer)) >= 3;

    validationReport.perSection[key] = /** @type {!kimlikdao.SectionReport} */({
      isValid,
      errors: isValid ? [] : [err(ErrorCode.INSUFFICIENT_SIGNER_COUNT)]
    });
    validationReport.isValid &&= isValid;
  }

  return Promise.resolve(validationReport);
}

/**
 * @param {!did.DecryptedSections} decryptedSections
 * @param {string} ownerAddress
 * @return {!Promise<!kimlikdao.ValidationReport>}
 */
KPassSigners.prototype.validateSigners = function (decryptedSections, ownerAddress) {
  /** @const {!Set<string>} */
  const allSigners = new Set();
  /** @const {!Object<string, !Array<string>>} */
  const signersPerSection = {};
  for (const key in decryptedSections) {
    const signers = recoverSectionSigners(key, decryptedSections[key], ownerAddress);
    signersPerSection[key] = signers;
    for (const signer in signers)
      allSigners.add(signer);
  }
  /** @const {!Array<string>} */
  const allSignersList = [...allSigners];
  /** @const {!Array<!Array<*>>} */
  const paramsList = allSignersList.map((signer) => [/** @type {!eth.Transaction} */({
    data: "0x2796d3f1" + evm.address(signer),
    to: KPASS_SIGNERS
  }),
    "latest"]);
  paramsList.push([/** @type {!eth.Transaction} */({
    data: "0x46fc4be1", // signerCountNeeded()
    to: KPASS_SIGNERS
  }), "latest"], [/** @type {!eth.Transaction} */({
    data: "0xc8676ec4", // signerStakeNeeded()
    to: KPASS_SIGNERS
  }), "latest"]);

  return jsonrpc.callMulti(this.nodeUrls['0xa86a'],
    'eth_call',
    paramsList
  ).then((/** !Array<string> */ signersInfoHex) => {
    /** @const {number} */
    const signerStakeNeeded = parseInt(signersInfoHex.pop().slice(-12), 16);
    /** @const {number} */
    const signerCountNeeded = parseInt(signersInfoHex.pop().slice(-2), 16);

    /**
     * @typedef {{
     *   endTs: number,
     *   startTs: number,
     *   deposit: number
     * }}
     */
    const SignerInfo = {};

    /**
     * @const {!Object<string, !SignerInfo>}
     */
    const signerToInfo = {};

    for (let i = 0; i < allSignersList.length; ++i)
      signerToInfo[allSignersList[i]] = /** @const {!SignerInfo} */({
        endTs: parseInt(signersInfoHex[i].slice(26, 38), 16),
        startTs: parseInt(signersInfoHex[i].slice(-12), 16),
        deposit: parseInt(signersInfoHex[i].slice(38, 50), 16)
      });
    /** @const {!kimlikdao.ValidationReport} */
    const validationReport = {
      isValid: true,
      isAuthenticated: false,
      errors: [],
      perSection: {}
    };
    for (const key in signersPerSection) {
      /** @const {number} */
      const ts = decryptedSections[key].signatureTs;
      /** @type {number} */
      let signerCount = 0;
      /** @type {number} */
      let signerStake = 0;
      for (const signer in signersPerSection[key]) {
        /** @type {!SignerInfo} */
        const si = signerToInfo[signer];
        if (si.startTs < ts && (si.endTs == 0 || ts < si.endTs)) {
          signerCount += 1;
          signerStake += si.deposit;
        }
      }
      /** @const {!Array<!kimlikdao.Error>} */
      const errors = [];
      if (signerCount < signerCountNeeded)
        errors.push(err(ErrorCode.INSUFFICIENT_SIGNER_COUNT));
      if (signerStake < signerStakeNeeded)
        errors.push(err(ErrorCode.INSUFFICIENT_SIGNER_STAKE));

      validationReport.isValid &&= errors.length == 0;
      validationReport.perSection[key] = /** @type {!kimlikdao.SectionReport} */({
        isValid: errors.length == 0,
        errors
      })
    }
    return validationReport;
  })
}

export { KPassSigners };
