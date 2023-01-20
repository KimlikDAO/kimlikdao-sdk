import { ErrorCode, err } from "./error";

/**
 * @param {!ErrorCode} report
 * @param {!Array<string>=} details
 * @return {!Promise<*>}
 */
const reportError = (code, details) =>
  Promise.resolve(/** @type {!kimlikdao.ValidationReport} */({
    isValid: false,
    errors: [err(code, details)]
  }))

export { reportErrorCode };
