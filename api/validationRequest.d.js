/**
 * @author KimlikDAO
 * @externs
 */

/**
 * @typedef {{
*   nonce: string,
*   text: string,
* }}
*/
kimlikdao.Challenge;

/**
* A request sent to to a `kimlikdao.Validator` to validate the authenticity of
* a DID.
*
* If a `challenge` and a `signature` is provided, the `address` can be
* omitted, since we can recover it from the signature.
*
* @typedef {{
*   challenge: kimlikdao.Challenge,
*   signature: string,
*   ownerAddress: (string|undefined),
*   chainId: string,
*   didContract: string,
*   decryptedSections: !did.DecryptedSections,
* }}
*/
kimlikdao.ValidationRequest;
