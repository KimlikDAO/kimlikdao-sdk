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
      return TCKT.handleOf(accounts[0])
        .then((cidHex) => !!cidHex.slice(2).replaceAll("0", ""));
    })

/**
 * Given an array of `InfoSection`s, determines a minimal set of unlockables
 * which, when unlocked, would cover all the desired `InfoSection`'s.
 *
 * @param {!ERC721Unlockable} nft
 * @param {!Array<string>} infoSections
 * @return {!Array<!Unlockable>}
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
  // `n = |nft.unlockables|`. Otherwise, we'll resort to a greedy approach.
  /** @const {Set<string>} */
  const iss = new Set(infoSections);

  /**
   * @const {Array<{
   *   inc: !Set<string>,
   *   exc: !Set<string>,
   *   unlockable: !Unlockable
   * }>}
   */
  const arr = [];
  {
    /** @type {number} */
    let bestI = -1;
    /** @type {number} */
    let bestExc = 1e9;
    for (const key in nft.unlockables) {
      /** @const {!Array<string>} */
      const sections = key.split(",");
      /** @const {!Set<string>} */
      const inc = new Set(sections.filter((e) => iss.has(e)));
      /** @const {!Set<string>} */
      const exc = new Set(sections.filter((e) => !iss.has(e)));
      if (inc.size == iss.size && (bestI < 0 || bestExc > exc.size)) {
        bestI = arr.length;
        bestExc = exc.size;
      }
      arr.push({
        inc,
        exc,
        unlockable: nft.unlockables[key]
      });
    }
    // There is a solution with 1 unlockable.
    if (bestI >= 0)
      return [arr[bestI].unlockable];
  }

  /**
   * Scores 100 * |A \cup B| + |A| + |B|
   *
   * @param {Set<string>} A
   * @param {Set<string>} B
   * @return {number}
   */
  const score = (A, B) => {
    /** @type {number} */
    let count = 101 * (A.size + B.size);
    B.forEach((b) => count -= +A.has(b) * 100);
    return count;
  }

  /** @const {number} */
  const n = arr.length;
  /** @type {number} */
  let bestI = -1;
  /** @type {number} */
  let bestJ = -1;
  /** @type {number} */
  let bestExc = 1e9;
  for (let i = 0; i < n; ++i)
    for (let j = i + 1; j < n; ++j)
      if (infoSections.every((x) => arr[i].inc.has(x) || arr[j].inc.has(x))) {
        const exc = score(arr[i].exc, arr[j].exc);
        if (exc < bestExc) {
          bestI = i;
          bestJ = j;
          bestExc = exc;
        }
      }
  // There is a solution with 2 unlockables.
  if (bestI >= 0)
    return [arr[bestI].unlockable, arr[bestJ].unlockable];

  // Since there are no solutions with 1 or 2 unlockables, we'll resort to a
  // greedy algorithm.
  arr.sort((a, b) => (b.inc.size - b.exc.size) - (a.inc.size - a.exc.size));
  /** @const {!Array<!Unlockable>} */
  const res = [];
  for (const entry of arr) {
    if (!iss.size) break;
    /** @type {boolean} */
    let helpful = false;
    for (const elm of entry.inc)
      helpful |= iss.delete(elm);
    if (helpful)
      res.push(entry.unlockable);
  }
  return res;
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

export default window["kimlikdao"];