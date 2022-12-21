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
 *   ownerAddress: (string|undefined),
 *   didContract: string,
 *   decryptedInfos: !did.DecryptedInfos,
 * }}
 */
kimlikdao.ValidationRequest;

/**
 * @typedef {{
 *   result: string,
 *   error: (string|undefined),
 *   authenticated: boolean,
 *   perInfoSection: !Object<string, Array<string>>
 * }}
 */
kimlikdao.ValidationReport;
