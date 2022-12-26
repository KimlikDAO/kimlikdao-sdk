/**
 * @fileoverview
 *
 * @author KimlikDAO
 * @externs
 */

var KimlikDAO;

/**
 * @const {string}
 */
KimlikDAO.prototype.validatorUrl;

/**
 * @const {string}
 */
KimlikDAO.prototype.ipfsUrl;

/**
 * @const {!eth.Provider}
 */
KimlikDAO.prototype.provider;

/**
 * @type {function():Promise<kimlikdao.Challenge>}
 */
KimlikDAO.prototype.generateChallenge;

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
 * info sections and returns them without validating with a remote validator.
 *
 * @param {string} didContract
 * @param {!Array<string>} infoSections
 * @return {Promise<!did.DecryptedInfos>}
 */
KimlikDAO.prototype.getUnvalidated;

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `Validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {string} didContract
 * @param {!Array<string>} infoSections
 * @param {boolean=} validateOwnerAddress
 * @return {Promise<*>}
 */
KimlikDAO.prototype.getValidated;
