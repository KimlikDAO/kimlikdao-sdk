
/** @enunm {number} */
const ErrorCode = {
  UNSUPPORTED_DID: 1,
  STALE_CHALLENGE_RESPONSE: 2,
  UNAUTHENTICATED_NOT_ALLOWED: 3,
  OWNER_ADDRESS_MISSING: 4,
  REVOKED_SECTION: 5,
  EXPOSURE_REPORTED_SECTION: 6,
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
