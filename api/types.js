/**
 * @author KimlikDAO
 * @externs
 */

/** @const */
var kimlikdao = {};

/**
 * @typedef {{
 *   nonce: string,
 *   text: string,
 * }}
 */
kimlikdao.Challenge;

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
 *   decryptedInfos: !did.DecryptedInfos,
 *   merkleProof: !Object<string, string>
 * }}
 */
kimlikdao.ValidationRequest;

/**
 * @typedef {{
 *   validity: string,
 *   authenticated: boolean,
 *   perInfoSection: Object<string, string>
 * }}
 */
kimlikdao.ValidationReport;
