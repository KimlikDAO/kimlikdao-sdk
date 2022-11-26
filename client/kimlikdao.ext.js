/**
 * @fileoverview
 * @externs
 */

/**
 * @const
 */
var kimlikdao = {};

/**
 * @typedef {{
 *   nonce: string,
 *   text: string,
 * }}
 */
kimlikdao.Challenge;

/**
 * @typedef {{
 *   challenge: kimlikdao.Challenge,
 *   signature: string,
 *   decryptedTckt: Object<string, InfoSection>
 * }}
 */
kimlikdao.ValidationRequest;

/**
 * Checks whether the connected address has a TCKT on-chain.
 * Note one may have a TCKT on-chain, but it may not be valid; we can only
 * be sure that the TCKT is valid by using the `kimlikdao.validateInfoSection()`
 * method.
 *
 * @return {Promise<boolean>} whether the connected wallet has a TCKT.
 */
kimlikdao.hasTckt;

/**
 * @param {Array<string>} infoSections
 * @return {Promise<Object<string, InfoSection>>}
 */
kimlikdao.getInfoSections;

/**
 * @constructor
 * 
 * @param {string} url
 * @param {function():Promise<kimlikdao.Challenge>} generateChallenge
 */
kimlikdao.Validator;

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `validator`.
 *
 * The response returned from the validator is parsed as a json file and
 * returned to the caller verbatim.
 *
 * @param {Array<string>} infoSections
 * @param {kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateTckt;
