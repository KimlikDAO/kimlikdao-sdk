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
      return TCKT.handleOf(accounts[0]).then((cidHex) => !!BigInt(cidHex));
    })

/**
 * @param {!ERC721Unlockable} nft
 * @param {!Array<string>} infoSections
 * @return {!Array<Unlockable>}
 */
kimlikdao.selectUnlockables = (nft, infoSections) => {
  if (nft.unlockable)
    return [nft.unlockable];
  if (!nft.unlockables)
    return [];
  if (nft.unlockables.length <= 1)
    return Object.values(nft.unlockables);

  // If there is a solution with 1 or 2 unlockables, we'll find the optimal
  // solution using exhaustive search, which takes O(n^2) time where
  // `n = nft.unlockables.length`. Otherwise, we'll resort to a greedy
  // approach.
  /** @const {Set<string>} */
  const iss = new Set(infoSections);

  /**
   * @const {Array<{
   *   set: Set<string>,
   *   extra: number,
   *   unlockable: Unlockable
   * }>}
   */
  const arr = [];
  /** @type {number} */
  let sln = -1;
  for (const key in nft.unlockables) {
    /** @const {!Array<string>} */
    const sections = key.split(",");
    /** @const {!Set<string>} */
    const set = new Set(sections.filter((e) => iss.has(e)));
    /** @const {number} */
    const extra = sections.length - set.size;
    if (set.size == iss.size && (sln < 0 || arr[sln].extra > extra))
      sln = arr.length;
    arr.push({
      set,
      extra,
      unlockable: nft.unlockables[key]
    });
  }
  if (sln >= 0)
    return [arr[sln].unlockable];

  /** @const {number} */
  const n = arr.length;
  /** @type {number} */
  let bestI = -1;
  /** @type {number} */
  let bestJ = -1;
  /** @type {number} */
  let bestExtra = 1e9;
  for (let i = 0; i < n; ++i)
    for (let j = i + 1; j < n; ++j)
      if (arr[i].extra + arr[j].extra < bestExtra
        && infoSections.every((x) => arr[i].set.has(x) || arr[j].set.has(x))) {
        bestExtra = arr[i].extra + arr[j].extra;
        bestI = i;
        bestJ = j;
      }
  if (bestI >= 0)
    return [arr[bestI].unlockable, arr[bestJ].unlockable];

  return [nft.unlockables["personInfo"]];
}

/**
 * @param {string} address
 * @param {!Array<string>} infoSections
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
      const unlockables = kimlikdao.selectUnlockables(tcktData, infoSections);

      /** @type {!Object<string, InfoSection>} */
      let decryptedTckt = {};
      for (let i = 0; i < unlockables.length; ++i) {
        delete unlockables[i].userPrompt;
        /** @const {string} */
        const hexEncoded = "0x" +
          hex(asciiEncoder.encode(JSON.stringify(unlockables[i])));
        if (i > 0)
          await new Promise((resolve) => setTimeout(() => resolve(), 100));
        /** @type {string} */
        let decryptedText = await ethereum.request(/** @type {RequestParams} */({
          method: "eth_decrypt",
          params: [hexEncoded, address]
        }));
        decryptedText = decryptedText.slice(43, decryptedText.indexOf("\0"));
        Object.assign(decryptedTckt,
          /** @type {Object<string, InfoSection>} */(JSON.parse(decryptedText)));
      }
      /** @const {Set<string>} */
      const infoSectionSet = new Set(infoSections);
      for (const infoSection of Object.keys(decryptedTckt))
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
 * @param {kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateTckt = (infoSections, validator, validateAddress) =>
  ethereum.request(/** @type {RequestParams} */({ method: "eth_accounts" }))
    .then((accounts) => {
      if (accounts.length == 0) return Promise.reject();
      const address = accounts[0];

      const challengePromise = validateAddress
        ? validator.generateChallenge()
          .then((challenge) => ethereum.request(/** @type {RequestParams} */({
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
