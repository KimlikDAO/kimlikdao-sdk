/**
 * @fileoverview
 */
import TCKT from "../lib/ethereum/TCKT";
import ipfs from "../lib/ipfs";
import { unlockableSeç } from "../lib/tckt/TCKTVerisi"
import { hex } from '/lib/util/çevir';
window["kimlikdao"] = {};

/**
 * Checks whether the connected address has a TCKT on-chain.
 * Note one may have a TCKT on-chain, but it may not be valid; we can only
 * be sure that the TCKT is valid by using the `kimlikdao.validateInfoSection()`
 * method.
 *
 * @return {Promise<boolean>} whether the connected wallet has a TCKT.
 */
kimlikdao.hasTckt = () => {
  ethereum.request(/** @type {RequestParams} */({ method: "eth_accounts" }))
    .then(accounts => {
      if (accounts.length == 0) return Promise.reject();
      return TCKT.handleOf(accounts[0]).then((cidHex) =>
        cidHex != "0x" + "0".repeat(64)
      )
    })
}

/**
 * @param {Array<string>} infoSections
 * @return {Promise<Object<string, InfoSection>>}
 */
kimlikdao.getInfoSections = (infoSections) => {
  ethereum.request(/** @type {RequestParams} */({ method: "eth_accounts" }))
    .then(accounts => {
      TCKT.handleOf(accounts[0]).then((cidHex) => {
        ipfs.cidBytetanOku(cidHex).then((data) => {
          /** @const {!ERC721Unlockable} */
          const tcktData = /** @const {!ERC721Unlockable} */(JSON.parse(data));
          /** @const {Unlockable} */
          const unlockable = unlockableSeç(tcktData, infoSections);
          delete unlockable.userPrompt;
          const asciiEncoder = new TextEncoder();
          /** @const {string} */
          const hexEncoded = "0x" + hex(asciiEncoder.encode(JSON.stringify(unlockable)));
          return ethereum.request(/** @type {RequestParams} */({
            method: "eth_decrypt",
            params: [hexEncoded, accounts[0]]
          }))
        })
      })
    })
}

/**
 * @constructor
 * 
 * @param {string} url
 */
kimlikdao.Validator = function (url) {
  this.url = url;
}

/**
 * Given a list of `InfoSection` names, requests the user to decrypt the
 * info sections and sends the decrypted info sections for validation to
 * the remote `validator`.
 *
 * The response returned from the validator is parsed as a json file and
 * returned to the caller verbatim.
 *
 * @param {Array<string>} infoSections
 * @param {kimlikdao.Validator} validator
 * @param {boolean} validateAddress
 * @return {Promise<*>}
 */
kimlikdao.validateInfoSections = (infoSections, validator, validateAddress) => {
  console.log(infoSections, validator, validateAddress);
  return Promise.resolve({});
}
