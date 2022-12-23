/**
 * @fileoverview Server side TCKT validator.
 *
 * @author KimlikDAO
 */

import { TCKT } from "./TCKT";
import evm from "/lib/ethereum/evm";

/**
 * @constructor
 *
 * @param {!Object<string, string>} nodeUrls
 * @param {!Array<string>} acceptedContracts
 * @param {function(kimlikdao.Challenge):Promise<boolean>=} validateChallenge
 * @param {boolean=} allowUnauthenticated
 */
function Validator(nodeUrls, acceptedContracts, validateChallenge, allowUnauthenticated) {
  /** @const {!Object<string, string>} */
  this.nodeUrls = nodeUrls;
  /** @const {!Set<string>} */
  this.acceptedContracts = new Set(acceptedContracts || [TCKT_ADDR]);
  /** @const {TCKT} */
  this.tckt = new TCKT(nodeUrls);
  /**
   * Record the user provided challenge validator. If none provided, use the
   * validator for the default challenge generator.
   * 
   * @const {function(kimlikdao.Challenge):Promise<boolean>}
   */
  this.validateChallenge = validateChallenge || ((challenge) => {
    const timestamp = +challenge.nonce;
    const now = Date.now();
    return Promise.resolve(timestamp < now + 1000 && timestamp + 6e8 > now &&
      challenge.text.endsWith(new Date(timestamp)));
  });
  /** @const {boolean} */
  this.allowUnauthenticated = allowUnauthenticated;
}

/**
 * @param {kimlikdao.ValidationRequest} request
 * @return {Promise<kimlikdao.ValidationReport>}
 */
Validator.prototype.validate = function (req) {
  const validateWithAddress = (address, authenticated) => this.tckt.handleOf(address)
    .then((cidHex) => {
      if (evm.isZero(cidHex))
        return Promise.reject(/** @type {kimlikdao.Validationreport} */({
          result: "fail",
          authenticated,
          details: { "contract": ["TCKT was revoked or never created"] }
        }));
    });

  if (res.challenge) {
    const address = evm.signerAddress(
      evm.personalDigest(challenge.text), challenge.signature);
    return this.validateChallenge(req.challenge)
      .then((isValid) => isValid ? withAddress(address, true) : { validity: "-1" });
  } else
    return challenge.address ? withAddress(challenge.address, false)
      : { validity: "-2" }
}

/**
 * @param {did.InfoSection} infoSection
 * @param {string} chainId
 * @param {string} address
 * @param {string} commitSecret
 * @return {boolean} whether the info section has a valid signature.
 */
const verifyInfoSection = (infoSection, chainId, address, commitSecret) => {
  return false;
}

/**
 * @param {did.DecryptedInfos} decryptedTckt
 * @param {string} chainId
 * @param {string} address
 * @param {string} commitSecret
 * @return {boolean} whether each info section of the decrypted TCKT has a
 *                   valid signature.
 */
const verifyDecryptedInfos = (decryptedInfos, chainId, address, commitSecret) => {
  return false;
}

export {
  Validator
};
