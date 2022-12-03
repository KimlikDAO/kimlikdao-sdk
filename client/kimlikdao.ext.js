/**
 * @fileoverview
 * @externs
 */

/**
 * @const
 */
const kimlikdao = {};

/**
 * @typedef {{
 *   nonce: string,
 *   text: string,
 * }}
 */
kimlikdao.Challenge;

/**
 * @constructor
 *
 * @param {string} url
 * @param {function():Promise<kimlikdao.Challenge>} generateChallenge
 */
kimlikdao.Validator;

/**
 * A request sent to to a `kimlikdao.Validator` to validate the authenticity of
 * a TCKT.
 *
 * If a `challenge` and a `signature` is provided, the `address` can be
 * omitted.
 *
 * @typedef {{
 *   challenge: kimlikdao.Challenge,
 *   signature: string,
 *   address: (string|undefined),
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
 * @param {!ERC721Unlockable} nft
 * @param {!Array<string>} infoSections
 * @return {!Array<!Unlockable>}
 */
kimlikdao.selectUnlockables;

/**
 * @param {string} address
 * @param {!Array<string>} infoSections
 * @return {Promise<Object<string, InfoSection>>}
 */
kimlikdao.getInfoSections;

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `validator`.
 *
 * The response returned from the validator is parsed as a json file and
 * returned to the caller verbatim.
 *
 * @param {!Array<string>} infoSections
 * @param {!kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateTckt;
