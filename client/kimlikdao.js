/**
 * @fileoverview
 */
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
  ethereum.request(/** @type {RequestParams} */({ method: "eth_accounts" }))
    .then((accounts) => {
      if (accounts.length == 0) return Promise.reject();
      return TCKT.handleOf(accounts[0]).then((cidHex) =>
        BigInt(cidHex) != 0n
      );
    })

/**
 * @param {!ERC721Unlockable} erc721Unlockable
 * @param {Array<string>} infoSections
 * @return {!Array<Unlockable>}
 */
const selectUnlockables = (erc721Unlockable, infoSections) => {
  return [erc721Unlockable.unlockables["personInfo"]];
}

/**
 * @param {string} address
 * @param {Array<string>} infoSections
 * @return {Promise<Object<string, InfoSection>>}
 */
kimlikdao.getInfoSections = (address, infoSections) =>
  TCKT.handleOf(address).then((cidHex) =>
    ipfs.cidBytetanOku(hexten(cidHex)).then(async (data) => {
      /** @const {!ERC721Unlockable} */
      const tcktData = /** @const {!ERC721Unlockable} */(JSON.parse(data));
      /** @const {TextEncoder} */
      const asciiEncoder = new TextEncoder();
      /** @const {!Array<Unlockable>} */
      const unlockables = selectUnlockables(tcktData, infoSections);

      let decryptedTckt = {};
      for (let i = 0; i < unlockables.length; ++i) {
        let unlockable = unlockables[i];
        delete unlockable.userPrompt;
        /** @const {string} */
        const hexEncoded = "0x" + hex(asciiEncoder.encode(JSON.stringify(unlockable)));
        /** @type {string} */
        let decryptedText = await ethereum.request(/** @type {RequestParams} */({
          method: "eth_decrypt",
          params: [hexEncoded, address]
        }));
        if (i + 1 < unlockables.length)
          await new Promise((resolve) => setTimeout(() => resolve(), 100));
        decryptedText = decryptedText.slice(43, decryptedText.indexOf("\0"));
        Object.assign(decryptedTckt,
          /** @type {Object<string, InfoSection>} */(JSON.parse(decryptedText)));
      }
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
 * @param {Array<string>} infoSections
 * @param {kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateTckt = (infoSections, validator, validateAddress) =>
  ethereum.request(/** @type {RequestParams} */({ method: "eth_accounts" }))
    .then((accounts) => {
      if (accounts.length == 0) return Promise.reject();

      const challengePromise = validateAddress
        ? validator.generateChallenge()
          .then((challenge) => ethereum.request(/** @type {RequestParams} */({
            method: "personal_sign",
            params: [challenge.text, accounts[0]]
          })).then((signature) => /** @type {kimlikdao.ValidationRequest} */({
            challenge,
            signature: evm.compactSignature(signature),
          })))
        : Promise.resolve({ address: accounts[0] });

      return challengePromise
        .then((request) => kimlikdao.getInfoSections(accounts[0], infoSections)
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
