import { err, ErrorCode } from "./error";

/**
 * @param {!ErrorCode} code
 * @param {!Array<string>=} details
 * @return {!Promise<!kimlikdao.ValidationReport>}
 */
const reportError = (code, details) =>
  Promise.resolve(/** @type {!kimlikdao.ValidationReport} */({
    isValid: false,
    errors: [err(code, details)]
  }))

export { reportError };
