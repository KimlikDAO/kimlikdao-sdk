/**
 * @fileoverview
 *
 * @author KimlikDAO
 */

import { decryptInfoSections } from "/lib/did/infoSection";
import evm from "/lib/ethereum/evm";
import TCKT, { TCKT_ADDR } from "/lib/ethereum/TCKT";
import ipfs from "/lib/ipfs";
import { hexten } from "/lib/util/çevir";

/**
 * @constructor
 * @param {string} validatorUrl
 * @param {!eth.Provider=} provider
 * @param {function():Promise<kimlikdao.Challenge>=} generateChallenge
 */
const KimlikDAO = function (validatorUrl, provider, generateChallenge) {
  /** @const {string} */
  this.validatorUrl = validatorUrl;
  /** @const {!eth.Provider} */
  this.provider = provider || window.ethereum;

  this.generateChallenge =
    generateChallenge || (() => {
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
 * be sure that the TCKT is valid by using the `kimlikdao.validateTckt()`
 * method.
 *
 * @param {string} didAddress
 * @return {Promise<boolean>} whether the connected wallet has a TCKT.
 */
KimlikDAO.prototype.hasDID = function (didAddress) {
  return this.provider
    .request(/** @type {eth.Request} */({ method: "eth_accounts" }))
    .then((addresses) => {
      if (addresses.length == 0) return Promise.reject();
      return TCKT.handleOf(addresses[0]).then((cidHex) => evm.isZero(cidHex));
    });
};

/**
 * Given a list of `InfoSection` names, prompts the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {string} didAddress
 * @param {!Array<string>} infoSections
 * @param {boolean|undefined} validateAddress
 * @return {Promise<*>}
 */
KimlikDAO.prototype.validate = function (
  didAddress,
  infoSections,
  validateAddress
) {
  return this.provider
    .request(/** @type {eth.Request} */({ method: "eth_accounts" }))
    .then((addresses) => {
      if (addresses.length == 0) return Promise.reject();
      const address = addresses[0];
      /** @const {Promise<string>} */
      const chainIdPromise = ethereum.request(
        /** @type {eth.Request} */({
          method: "eth_chainId",
        })
      );

      /** @const {Promise<kimlikdao.ValidationRequest>} */
      const challengePromise = validateAddress
        ? this.generateChallenge().then((challenge) =>
          ethereum
            .request(/** @type {eth.Request} */({
              method: "personal_sign",
              params: [challenge.text, address],
            }))
            .then((signature) => /** @type {kimlikdao.ValidationRequest} */({
              challenge,
              signature: evm.compactSignature(signature),
            })))
        : Promise.resolve({ address });

      /** @type {Promise<string>} */
      const filePromise = TCKT.handleOf(address).then((cidHex) =>
        evm.isZero(cidHex)
          ? Promise.reject("The wallet doesn't have a TCKT")
          : ipfs.cidBytetanOku(hexten(cidHex.slice(2)))
      );

      return Promise.all([challengePromise, chainIdPromise, filePromise])
        .then(([request, chainId, file]) =>
          decryptInfoSections(
            /** @const {!eth.ERC721Unlockable} */(JSON.parse(file)),
            infoSections,
            ethereum,
            address
          ).then((decryptedTcktWithProof) =>
              /** @type {kimlikdao.ValidationRequest} */({
            ...request,
            chainId,
            ...decryptedTcktWithProof,
          })))
        .then((request) => fetch(this.validatorUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          data: JSON.stringify(request),
        }));
    });
};

export { KimlikDAO };
