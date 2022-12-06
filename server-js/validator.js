/**
 * @fileoverview A library for verifying a TCKT.
 *
 * @author KimlikDAO
 */

import TCKT from "./TCKT";
import { keccak256 } from "/lib/crypto/sha3";

/**
 * @constructor
 *
 * @param {!Object<string, string>} nodeUrls
 * @param {function(kimlikdao.Challenge):Promise<boolean>} validateChallenge
 */
function Validator(nodeUrls) {
  /** @const {!Object<string, string>} */
  this.nodeUrls = nodeUrls;
  /** @const {TCKT} */
  this.tckt = new TCKT(nodeUrls);
  /** @const {function(kimlikdao.Challenge):Promise<boolean>} */
  this.validateChallenge = validateChallenge || ((challenge) => {
    const timestamp = +challenge.nonce;
    const now = Date.now();
    return Promise.resolve(timestamp < now && timestamp + 6e8 > now &&
      challenge.text.endsWith(new Date(timestamp)));
  });
}

const error = (error) => Promise.reject({ validity: error });

/**
 * @param {kimlikdao.ValidationRequest} request
 * @return {Promise<kimlikdao.ValidationReport>}
 */
Validator.prototype.validate = function (req) {
  const withAddress = (address, isAuth) => {
    this.tckt.handleOf(address).then(console.log);
  }

  if (res.challenge) {
    const address = evm.recoverSigner(
      keccak256("\x19Ethereum Signed Message:\n" + challenge.text));
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

export { Validator };
