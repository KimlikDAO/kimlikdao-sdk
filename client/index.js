/**
 * @fileoverview
 *
 * @author KimlikDAO
 */

import { fromUnlockableNFT } from "/lib/did/decryptedSections";
import evm from "/lib/ethereum/evm";
import TCKT, { TCKT_ADDR } from "/lib/ethereum/TCKTLite";
import ipfs from "/lib/node/ipfs";
import { hexten } from "/lib/util/çevir";

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
const KimlikDAO = function (params) {
  /** @const {string} */
  this.validatorUrl = params.validatorUrl || "";
  /** @const {!eth.Provider} */
  this.provider = params.provider || window.ethereum;
  /** @const {string} */
  this.ipfsUrl = params.ipfsUrl || "https://ipfs.kimlikdao.org";
};

/**
 * Checks whether the connected address has a TCKT on-chain.
 * Note one may have a TCKT on-chain, but it may not be valid; we can only
 * be sure that the TCKT is valid by using the `kimlikdao.validate()` method.
 *
 * @param {string} didContract
 * @return {!Promise<boolean>} whether the connected wallet has a TCKT.
 */
KimlikDAO.prototype.hasDID = function (didContract) {
  if (didContract != TCKT_ADDR)
    return Promise.reject("The requested DID is not supported yet.");
  return this.provider
    .request(/** @type {!eth.Request} */({ method: "eth_accounts" }))
    .then((addresses) => {
      if (addresses.length == 0) return Promise.reject();
      return TCKT.handleOf(addresses[0]).then((cidHex) => !evm.isZero(cidHex));
    });
};

/**
 * Given a list of `did.Section` names, requests the user to decrypt the
 * info sections and returns them without validating with a remote validator.
 *
 * @param {string} didContract
 * @param {!Array<string>} sectionNames
 * @return {!Promise<!did.DecryptedSections>}
 */
KimlikDAO.prototype.getUnvalidated = function (didContract, sectionNames) {
  if (didContract != TCKT_ADDR)
    return Promise.reject("The requested DID is not supported yet.");
  return this.provider
    .request(/** @type {!eth.Request} */({ method: "eth_accounts" }))
    .then((addresses) => {
      if (addresses.length == 0) return Promise.reject("No connected accounts.");
      /** @const {string} */
      const ownerAddress = addresses[0];
      return TCKT.handleOf(ownerAddress)
        .then((cidHex) =>
          evm.isZero(cidHex)
            ? Promise.reject("The wallet doesn't have a TCKT.")
            : ipfs.cidBytetanOku(this.ipfsUrl, hexten(cidHex.slice(2))))
        .then((file) => fromUnlockableNFT(
          /** @const {!eth.ERC721Unlockable} */(JSON.parse(file)),
          sectionNames,
          this.provider,
          ownerAddress
        ));
    });
}

/**
 * Given a list of `did.Section` names, prompts the user to decrypt the info
 * sections and sends the decrypted info sections for validation to the remote
 * `validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {string} didContract
 * @param {!Array<string>} sectionNames
 * @param {(function(!did.DecryptedSections):(
 *   !kimlikdao.Challenge|
 *   !Promise<!kimlikdao.Challenge>))=} getChallenge
 * @return {!Promise<!kimlikdao.ValidationRequest>}
 */
KimlikDAO.prototype.getValidationRequest = function (
  didContract,
  sectionNames,
  getChallenge
) {
  if (didContract != TCKT_ADDR)
    return Promise.reject("The requested DID is not supported yet.");
  return this.provider
    .request(/** @type {!eth.Request} */({ method: "eth_accounts" }))
    .then((addresses) => {
      if (addresses.length == 0) return Promise.reject("No connected accounts.");
      /** @const {string} */
      const ownerAddress = addresses[0];
      /** @const {!Promise<string>} */
      const chainIdPromise = this.provider
        .request(/** @type {!eth.Request} */({
          method: "eth_chainId",
        }));
      /** @type {!Promise<string>} */
      const filePromise = TCKT.handleOf(ownerAddress).then((cidHex) =>
        evm.isZero(cidHex)
          ? Promise.reject("The wallet doesn't have a TCKT.")
          : ipfs.cidBytetanOku(this.ipfsUrl, hexten(cidHex.slice(2)))
      );

      return Promise.all([chainIdPromise, filePromise])
        .then(([chainId, file]) =>
          fromUnlockableNFT(
            /** @const {!eth.ERC721Unlockable} */(JSON.parse(file)),
            sectionNames,
            this.provider,
            ownerAddress
          ).then((decryptedSections) => (getChallenge
            ? Promise.all([
              getChallenge(decryptedSections),
              new Promise((resolve) => setTimeout(resolve, 200))
            ]).then(([challenge, _]) => this.provider
              .request(/** @type {!eth.Request} */({
                method: "personal_sign",
                params: [challenge.text, ownerAddress],
              }))
              .then((/** @type {string} */ signature) => /** @type {!kimlikdao.ValidationRequest} */({
                challenge,
                signature: evm.compactSignature(signature),
              }))
            )
            : Promise.resolve(/** @type {!kimlikdao.ValidationRequest} */({ ownerAddress })))
            .then((/** @type {!kimlikdao.ValidationRequest} */ request) =>
              /** @type {!kimlikdao.ValidationRequest} */({
              ...request,
              chainId,
              didContract,
              decryptedSections,
            })))
        );
    });
}

/**
 * Given a list of `did.Section` names, prompts the user to decrypt the info
 * sections and sends the decrypted info sections for validation to the remote
 * `validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {string} didContract
 * @param {!Array<string>} sectionNames
 * @param {(function(!did.DecryptedSections):(
*   !kimlikdao.Challenge|
*   !Promise<!kimlikdao.Challenge>))=} getChallenge
 * @return {!Promise<!Response>}
 */
KimlikDAO.prototype.getValidated = function (
  didContract,
  sectionNames,
  getChallenge
) {
  return this.getValidationRequest(didContract, sectionNames, getChallenge)
    .then((request) => fetch(this.validatorUrl, {
      method: "POST",
      headers: { "content-type": "application/json;charset=utf-8" },
      data: JSON.stringify(request),
    }));
}

export { KimlikDAO };
