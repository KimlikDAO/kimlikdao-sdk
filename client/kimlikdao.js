/**
 * @fileoverview
 */

import { selectUnlockables } from '/lib/did/infoSection';
import evm from "/lib/ethereum/evm";
import TCKT from "/lib/ethereum/TCKT";
import ipfs from "/lib/ipfs";
import { hex, hexten } from '/lib/util/çevir';

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
  ethereum.request(/** @type {ethereum.Request} */({ method: "eth_accounts" }))
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
  TCKT.handleOf(address).then((cidHex) =>
    ipfs.cidBytetanOku(hexten(cidHex)).then(async (data) => {
      /** @const {!ERC721Unlockable} */
      const tcktData = /** @const {!ERC721Unlockable} */(JSON.parse(data));
      /** @const {TextEncoder} */
      const asciiEncoder = new TextEncoder();
      /** @const {!Array<!Unlockable>} */
      const unlockables = selectUnlockables(tcktData, infoSections);

      /** @type {!did.DecryptedDID} */
      let decryptedTckt = {};
      for (let i = 0; i < unlockables.length; ++i) {
        delete unlockables[i].userPrompt;
        /** @const {string} */
        const hexEncoded = "0x" +
          hex(asciiEncoder.encode(JSON.stringify(unlockables[i])));
        if (i > 0)
          await new Promise((resolve) => setTimeout(() => resolve(), 100));
        /** @type {string} */
        let decryptedText = await ethereum.request(/** @type {ethereum.Request} */({
          method: "eth_decrypt",
          params: [hexEncoded, address]
        }));
        decryptedText = decryptedText.slice(43, decryptedText.indexOf("\0"));
        Object.assign(decryptedTckt,
          /** @type {!did.DecryptedDID} */(JSON.parse(decryptedText)));
      }
      /** @const {Set<string>} */
      const infoSectionSet = new Set(infoSections);
      for (const infoSection in decryptedTckt)
        if (!infoSectionSet.has(infoSection)) delete decryptedTckt[infoSection];

      return decryptedTckt;
    })
  )

/**
 * @constructor
 * 
 * @param {string} url
 * @param {function():Promise<kimlikdao.Challenge>} generateChallenge
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
  ethereum.request(/** @type {ethereum.Request} */({ method: "eth_accounts" }))
    .then((accounts) => {
      if (accounts.length == 0) return Promise.reject();
      const address = accounts[0];

      const challengePromise = validateAddress
        ? validator.generateChallenge()
          .then((challenge) => ethereum.request(/** @type {ethereum.Request} */({
            method: "personal_sign",
            params: [challenge.text, address]
          })).then((signature) => /** @type {kimlikdao.ValidationRequest} */({
            challenge,
            signature: evm.compactSignature(signature),
          })))
        : Promise.resolve({ address });

      return challengePromise
        .then((request) => kimlikdao.getInfoSections(address, infoSections)
          .then((decryptedTckt) => /** @type {kimlikdao.ValidationRequest} */({
            ...request,
            decryptedTckt
          }))
        )
        .then((request) => fetch(validator.url, {
          method: "POST",
          headers: { 'content-type': 'application/json' },
          data: JSON.stringify(request)
        }));
    });

export default window["kimlikdao"];
