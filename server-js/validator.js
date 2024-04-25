/**
 * @fileoverview KimlikDAO DID validator.
 *
 * @author KimlikDAO
 */

import { ErrorCode, err } from "../api/error";
import { reportError } from "../api/validationReport";
import { KPass } from "./KPass";
import { KPassSigners } from "./KPassSigners";
import { ChainId } from "/lib/crosschain/chains";
import evm from "/lib/ethereum/evm";

/**
 * @constructor
 * @struct
 *
 * @param {!Object<ChainId, string>} nodeUrls
 * @param {Array<string>} acceptedContracts
 * @param {function(!kimlikdao.Challenge):boolean=} validateChallenge
 * @param {boolean=} allowUnauthenticated
 */
function Validator(nodeUrls, acceptedContracts, validateChallenge, allowUnauthenticated) {
  /** @const {!Object<string, string>} */
  this.nodeUrls = nodeUrls;
  /** @const {!KPass} */
  this.kpass = new KPass(nodeUrls);
  /** @const {!KPassSigners} */
  this.kpassSigners = new KPassSigners(nodeUrls);
  /** @const {!Set<string>} */
  this.acceptedContracts = new Set(acceptedContracts || this.kpass.ADDRS);

  /**
   * Record the user provided challenge validator. If none provided, use the
   * validator for the default challenge generator.
   * 
   * @const {function(!kimlikdao.Challenge):boolean}
   */
  this.validateChallenge = validateChallenge || ((challenge) => {
    const timestamp = +challenge.nonce;
    /** @const {number} */
    const now = Date.now();
    return timestamp < now + 1000 && timestamp + 6e8 > now &&
      challenge.text.endsWith("" + new Date(timestamp));
  });
  /** @const {boolean} */
  this.allowUnauthenticated = allowUnauthenticated || false;
}

/**
 * @param {string} ownerAddress
 * @param {boolean} isAuthenticated
 * @param {!did.DecryptedSections} decryptedSections
 * @return {!Promise<!kimlikdao.ValidationReport>}
 */
Validator.prototype.validateWithAddress = function (ownerAddress, isAuthenticated, decryptedSections) {
  /** @const {!Array<!Promise<*>>} */
  const promises = [
    this.kpass.lastRevokeTimestamp(ownerAddress),
    decryptedSections["personInfo"]
      ? this.kpass.exposureReported(
        /** @type {!did.PersonInfo} */(decryptedSections["personInfo"]).exposureReportID)
      : Promise.resolve(0),
    this.kpassSigners.validateSignersTemporary(decryptedSections, ownerAddress),
  ];

  return Promise.all(promises)
    .then(([
      /** @type {number} */ lastRevokeTs,
      /** @type {number} */ exposureReportedTs,
      /** @type {!kimlikdao.ValidationReport} */ validationReport
    ]) => {
      /** @type {boolean} */
      let isValid = true;
      for (const key in decryptedSections) {
        /** @const {!kimlikdao.SectionReport} */
        const sectionReport = validationReport[key];
        /** @const {number} */
        const ts = decryptedSections[key].signatureTs;
        if (ts < lastRevokeTs) {
          isValid = false;
          sectionReport.isValid = false;
          sectionReport.errors.push(err(ErrorCode.REVOKED_SECTION));
        }
        if (ts < exposureReportedTs) {
          isValid = false;
          sectionReport.isValid = false;
          sectionReport.errors.push(err(ErrorCode.EXPOSURE_REPORTED_SECTION));
        }
      }
      validationReport.isAuthenticated = isAuthenticated;
      validationReport.isValid &&= isValid;
      return validationReport;
    });
}

/**
 * @param {!kimlikdao.ValidationRequest} request
 * @return {!Promise<!kimlikdao.ValidationReport>}
 */
Validator.prototype.validate = function (request) {
  if (!this.acceptedContracts.has(request.didContract))
    return reportError(ErrorCode.UNSUPPORTED_DID,
      [`Currently accepting: ${[...this.acceptedContracts].join(", ")}`]);

  if (request.challenge) {
    /** @const {!kimlikdao.Challenge} */
    const challenge = request.challenge;
    if (!request.signature)
      return reportError(ErrorCode.MISSING_SIGNATURE,
        ["If a challenge is provided, a corresponding signature is required"]);
    /** @const {string} */
    const ownerAddress = evm.signerAddress(
      evm.personalDigest(challenge.text), request.signature);
    return this.validateChallenge(challenge)
      ? this.validateWithAddress(ownerAddress, true, request.decryptedSections)
      : reportError(ErrorCode.STALE_CHALLENGE_RESPONSE);
  } else {
    if (!this.allowUnauthenticated)
      return reportError(ErrorCode.UNAUTHENTICATED_NOT_ALLOWED);
    if (!request.ownerAddress)
      return reportError(ErrorCode.OWNER_ADDRESS_MISSING);
    return this.validateWithAddress(request.ownerAddress, false, request.decryptedSections);
  }
}

export { Validator };
