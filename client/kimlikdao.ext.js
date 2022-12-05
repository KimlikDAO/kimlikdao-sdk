/**
 * @fileoverview
 *
 * @author KimlikDAO
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
 * @param {function():Promise<kimlikdao.Challenge>=} generateChallenge
 */
kimlikdao.Validator;

/**
 * A `MerkleProof` is a base64 encoded `Uint8Array` of length 32 * k for
 * some k. For an `Unlockable` containing k `InfoSection`s the proof is the
 * concatenation of the sha256 hash of each `InfoSection`.
 *
 * @typedef {string}
 */
kimlikdao.MerkleProof;

/**
 * A request sent to to a `kimlikdao.Validator` to validate the authenticity of
 * a TCKT.
 *
 * If a `challenge` and a `signature` is provided, the `address` can be
 * omitted, since we can recover it from the signature.
 *
 * @typedef {{
 *   challenge: kimlikdao.Challenge,
 *   signature: string,
 *   address: (string|undefined),
 *   chainId: string,
 *   decryptedDid: !did.DecryptedDID,
 *   merkleProofs: !Object<string, !kimlikdao.MerkleProof>
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
 * @param {string} address
 * @param {!Array<string>} infoSections
 * @return {Promise<did.DecryptedDID>}
 */
kimlikdao.getInfoSections;

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `Validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {!Array<string>} infoSections
 * @param {!kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateTckt;
