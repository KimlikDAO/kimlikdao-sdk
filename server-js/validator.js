/**
 * @fileoverview KimlikDAO DID validator.
 *
 * @author KimlikDAO
 */

import { TCKT } from "./TCKT";
import { TCKTSigners} from "./TCKTSigners";
import { err, ErrorCode } from "/api/error";
import { reportError } from "/api/validationReport";
import evm from "/lib/ethereum/evm";

/**
 * @constructor
 * @struct
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
  /** @const {!TCKT} */
  this.tckt = new TCKT(nodeUrls);
  /** @const {!TCKTSigners} */
  this.tcktSigners = new TCKTSigners(nodeUrls);

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
 * @param {string} ownerAddress
 * @param {boolean} isAuthenticated
 * @param {!did.DecryptedSections} decryptedSections
 * @return {!Promise<!kimlikdao.ValidationReport>}
 */
Validator.prototype.validateWithAddress = function (ownerAddress, isAuthenticated, decryptedSections) {
  /** @const {!Array<!Promise<*>>} */
  const promises = [
    this.tckt.lastRevokeTimestamp(ownerAddress),
    decryptedSections["personInfo"]
      ? this.tckt.exposureReported(decryptedSections["personInfo"]["exposureReportID"])
      : Promise.resolve(0),
    this.tcktSigners.validateSigners(decryptedSections, ownerAddress),
  ];

  return Promise.all(promises)
    .then(([lastRevokeTs, exposureReportedTs, validationReport]) => {
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
      validationReport.isValid &= isValid;
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
    /** @const {string} */
    const ownerAddress = evm.signerAddress(
      evm.personalDigest(challenge.text), challenge.signature);
    return this.validateChallenge(challenge)
      .then((isFresh) => isFresh
        ? this.validateWithAddress(ownerAddress, true, request.decryptedSections)
        : reportError(ErrorCode.STALE_CHALLENGE_RESPONSE));
  } else {
    if (!this.allowUnauthenticated)
      return reportError(ErrorCode.UNAUTHENTICATED_NOT_ALLOWED);
    if (!challenge.address)
      return reportError(ErrorCode.OWNER_ADDRESS_MISSING);
    return withAddress(challenge.address, false, request.decryptedSections);
  }
}

export { Validator };
