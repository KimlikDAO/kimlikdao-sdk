/**
 * @fileoverview
 *
 * @author KimlikDAO
 */

import { decryptSections } from "/lib/did/section";
import evm from "/lib/ethereum/evm";
import TCKT, { TCKT_ADDR } from "/lib/ethereum/TCKT";
import ipfs from "/lib/node/ipfs";
import { hexten } from "/lib/util/çevir";

/**
 * @constructor
 * @param {KimlikDAO} params
 */
const KimlikDAO = function (params) {
  Object.assign(this, params);

  if (!this.provider && window["ethereum"])
    this.provider = window.ethereum;

  this.ipfsUrl ||= "https://ipfs.kimlikdao.org";

  this.generateChallenge ||= (() => {
    /** @const {number} */
    const timestamp = Date.now();
    return Promise.resolve({
      nonce: "" + timestamp,
      text:
        "Please sign to prove you own this account.\n\nTime: " +
        new Date(timestamp),
    });
  });

  /** @const {string} */
  this.TCKT = TCKT_ADDR;
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
    .request(/** @type {eth.Request} */({ method: "eth_accounts" }))
    .then((addresses) => {
      if (addresses.length == 0) return Promise.reject();
      return TCKT.handleOf(addresses[0]).then((cidHex) => evm.isZero(cidHex));
    });
};

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
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
        .then((file) => decryptSections(
          /** @const {!eth.ERC721Unlockable} */(JSON.parse(file)),
          sectionNames,
          ethereum,
          ownerAddress
        ));
    });
}

/**
 * Given a list of `InfoSection` names, prompts the user to decrypt the info
 * sections and sends the decrypted info sections for validation to the remote
 * `validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {string} didContract
 * @param {!Array<string>} sectionNames
 * @param {boolean=} skipOwnerValidation
 * @return {!Promise<*>}
 */
KimlikDAO.prototype.getValidated = function (
  didContract,
  sectionNames,
  skipOwnerValidation
) {
  if (didContract != TCKT_ADDR)
    return Promise.reject("The requested DID is not supported yet.");
  return this.provider
    .request(/** @type {eth.Request} */({ method: "eth_accounts" }))
    .then((addresses) => {
      if (addresses.length == 0) return Promise.reject("No connected accounts.");
      /** @const {string} */
      const ownerAddress = addresses[0];
      /** @const {!Promise<string>} */
      const chainIdPromise = ethereum.request(
        /** @type {eth.Request} */({
          method: "eth_chainId",
        })
      );

      /** @const {!Promise<!kimlikdao.ValidationRequest>} */
      const challengePromise = !skipOwnerValidation
        ? this.generateChallenge().then((challenge) =>
          ethereum
            .request(/** @type {!eth.Request} */({
              method: "personal_sign",
              params: [challenge.text, ownerAddress],
            }))
            .then((signature) => /** @type {!kimlikdao.ValidationRequest} */({
              challenge,
              signature: evm.compactSignature(signature),
            })))
        : Promise.resolve(
          /** @type {!kimlikdao.ValidationRequest} */({ ownerAddress }));

      /** @type {!Promise<string>} */
      const filePromise = TCKT.handleOf(ownerAddress).then((cidHex) =>
        evm.isZero(cidHex)
          ? Promise.reject("The wallet doesn't have a TCKT.")
          : ipfs.cidBytetanOku(this.ipfsUrl, hexten(cidHex.slice(2)))
      );

      return Promise.all([challengePromise, chainIdPromise, filePromise])
        .then(([request, chainId, file]) =>
          decryptSections(
            /** @const {!eth.ERC721Unlockable} */(JSON.parse(file)),
            sectionNames,
            ethereum,
            ownerAddress
          ).then((decryptedSections) =>
              /** @type {!kimlikdao.ValidationRequest} */({
            ...request,
            chainId,
            didContract,
            decryptedSections,
          })))
        .then((request) => fetch(this.validatorUrl, {
          method: "POST",
          headers: { "content-type": "application/json;charset=utf-8" },
          data: JSON.stringify(request),
        }));
    });
};

export { KimlikDAO };
