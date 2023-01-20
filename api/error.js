
/** @enum {number} */
const ErrorCode = {
  UNSUPPORTED_DID: 1,
  STALE_CHALLENGE_RESPONSE: 2,
  MISSING_SIGNATURE: 3,
  UNAUTHENTICATED_NOT_ALLOWED: 4,
  OWNER_ADDRESS_MISSING: 5,
  REVOKED_SECTION: 6,
  EXPOSURE_REPORTED_SECTION: 7,
  INSUFFICIENT_SIGNER_COUNT: 8,
  INSUFFICIENT_SIGNER_STAKE: 9,
}

/**
 * @param {!ErrorCode} code
 * @param {!Array<string>=} details
 * @return {!kimlikdao.Error}
 */
const err = (code, details) => /** @type {!kimlikdao.Error} */({
  code,
  details
});

export { err, ErrorCode };
