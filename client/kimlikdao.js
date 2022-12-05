/**
 * @fileoverview
 *
 * @author KimlikDAO
 */

import { decryptInfoSections } from '/lib/did/infoSection';
import evm from "/lib/ethereum/evm";
import TCKT from "/lib/ethereum/TCKT";
import ipfs from "/lib/ipfs";
import { hexten } from '/lib/util/çevir';

window["kimlikdao"] = {};

/**
 * Checks whether the connected address has a TCKT on-chain.
 * Note one may have a TCKT on-chain, but it may not be valid; we can only
 * be sure that the TCKT is valid by using the `kimlikdao.validateTckt()`
 * method.
 *
 * @return {Promise<boolean>} whether the connected wallet has a TCKT.
 */
kimlikdao.hasTckt = () =>
  ethereum.request(/** @type {eth.Request} */({ method: "eth_accounts" }))
    .then((accounts) => {
      if (accounts.length == 0) return Promise.reject();
      return TCKT.handleOf(accounts[0])
        .then((cidHex) => !!cidHex.slice(2).replaceAll("0", ""));
    })

/**
 * @param {string} address
 * @param {!Array<string>} infoSections
 */
kimlikdao.getInfoSections = (address, infoSections) =>
  TCKT.handleOf(address)
    .then((cidHex) => ipfs.cidBytetanOku(hexten(cidHex.slice(2))))
    .then((data) => decryptInfoSections(
      /** @const {!eth.ERC721Unlockable} */(JSON.parse(data)),
      infoSections,
      ethereum,
      address
    ));

/**
 * @constructor
 *
 * @param {string} url
 * @param {function():Promise<kimlikdao.Challenge>=} generateChallenge
 */
kimlikdao.Validator = function (url, generateChallenge) {
  this.url = url;
  this.generateChallenge = generateChallenge || (() => {
    /** @const {number} */
    const timestamp = Date.now();
    return Promise.resolve({
      nonce: "" + timestamp,
      text: "Please sign to prove you own this account.\n\nTime: " + new Date(timestamp)
    })
  });
}

/**
 * Given a list of `InfoSection` names, prompts the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {!Array<string>} infoSections
 * @param {!kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateTckt = (infoSections, validator, validateAddress) =>
  ethereum.request(/** @type {eth.Request} */({ method: "eth_accounts" }))
    .then((accounts) => {
      if (accounts.length == 0) return Promise.reject();
      const address = accounts[0];

      const chainIdPromise = ethereum.request(/** @type {eth.Request} */({
        method: "eth_chainId"
      }));
      const challengePromise = validateAddress
        ? validator.generateChallenge()
          .then((challenge) => ethereum.request(/** @type {eth.Request} */({
            method: "personal_sign",
            params: [challenge.text, address]
          })).then((signature) => /** @type {kimlikdao.ValidationRequest} */({
            challenge,
            signature: evm.compactSignature(signature),
          })))
        : Promise.resolve({ address });

      return Promise.all([challengePromise, chainIdPromise])
        .then(([request, chainId]) => kimlikdao.getInfoSections(address, infoSections)
          .then((decryptedTckt) => /** @type {kimlikdao.ValidationRequest} */({
            ...request,
            chainId,
            decryptedDid: decryptedTckt
          }))
        )
        .then((request) => fetch(validator.url, {
          method: "POST",
          headers: { 'content-type': 'application/json' },
          data: JSON.stringify(request)
        }));
    });

export default window["kimlikdao"];
