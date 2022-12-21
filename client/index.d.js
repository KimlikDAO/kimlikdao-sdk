/**
 * @fileoverview
 *
 * @author KimlikDAO
 * @externs
 */

/**
 * @constructor
 * @param {string} validatorUrl
 * @param {!eth.Provider=} provider
 * @param {function():Promise<kimlikdao.Challenge>=} generateChallenge
 */
var KimlikDAO;

/**
 * Checks whether the connected address has a TCKT on-chain.
 * Note one may have a TCKT on-chain, but it may not be valid; we can only
 * be sure that the TCKT is valid by using the `kimlikdao.validateInfoSection()`
 * method.
 *
 * @param {string} didContract
 * @return {Promise<boolean>} whether the connected wallet has a TCKT.
 */
KimlikDAO.prototype.hasDID;

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `Validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {string} didContract
 * @param {!Array<string>} infoSections
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
KimlikDAO.prototype.validate;
