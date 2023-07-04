/**
 * @fileoverview
 *
 * @author KimlikDAO
 * @externs
 */

/**
 * @constructor
 * @struct
 *
 * @param {{
 *   validatorUrl: (string|undefined),
 *   ipfsUrl: (string|undefined),
 *   provider: (!eth.Provider|undefined)
 * }} params
 */
const KimlikDAO = function (params) { };

/**
 * Checks whether the connected address has a TCKT on-chain.
 * Note one may have a TCKT on-chain, but it may not be valid; we can only
 * be sure that the TCKT is valid by using the `kimlikdao.getValidated()`
 * method.
 *
 * @param {string} didContract
 * @return {Promise<boolean>} whether the connected wallet has a TCKT.
 */
KimlikDAO.prototype.hasDID;

/**
 * Given a list of `did.Section` names, requests the user to decrypt the
 * info sections and returns them without validating with a remote validator.
 *
 * @param {string} didContract
 * @param {!Array<string>} sectionNames
 * @return {Promise<!did.DecryptedSections>}
 */
KimlikDAO.prototype.getUnvalidated;

/**
 * Given a list of `did.Section` names, requests the user to decrypt the
 * info sections and prepares the request to be sent for validation to
 * the remote `Validator`.
 *
 * @param {string} didContract
 * @param {!Array<string>} sectionNames
 * @param {(function(!did.DecryptedSections):(
*   !kimlikdao.Challenge|
*   !Promise<!kimlikdao.Challenge>))=} getChallenge
 * @return {Promise<!kimlikdao.ValidationRequest>}
 */
KimlikDAO.prototype.getValidationRequest;

/**
 * Given a list of `did.Section` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `Validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {string} didContract
 * @param {!Array<string>} sectionNames
 * @param {(function(!did.DecryptedSections):(
*   !kimlikdao.Challenge|
*   !Promise<!kimlikdao.Challenge>))=} getChallenge
 * @return {Promise<*>}
 */
KimlikDAO.prototype.getValidated;
