/**
 * @fileoverview
 *
 * @author KimlikDAO
 */

import { ChainId } from "/lib/crosschain/chainId";
import { Provider } from "/lib/crosschain/provider";
import { fromUnlockableNFT } from "/lib/did/decryptedSections";
import evm from "/lib/ethereum/evm";

/**
 * Given a list of `did.Section` names, prompts the user to decrypt the info
 * sections and sends the decrypted info sections for validation to the remote
 * `validator`.
 *
 * The response returned from the validator is passed onto the caller verbatim.
 *
 * @param {!Provider} provider
 * @param {ChainId} chainId
 * @param {string} didContract
 * @param {string} ownerAddress
 * @param {!eth.ERC721Unlockable} tcktNft
 * @param {!Array<string>} sectionNames
 * @param {(function(!did.DecryptedSections):(
 *   !kimlikdao.Challenge|
 *   !Promise<!kimlikdao.Challenge>))=} getChallenge
 * @return {!Promise<!kimlikdao.ValidationRequest>}
 */
const getValidationRequest = (
  provider,
  chainId,
  didContract,
  ownerAddress,
  tcktNft,
  sectionNames,
  getChallenge) => fromUnlockableNFT(
    tcktNft,
    sectionNames,
    provider,
    ownerAddress
  ).then((/** @type {!did.DecryptedSections} */ decryptedSections) => (getChallenge
    ? Promise.all([
      getChallenge(decryptedSections),
      new Promise((resolve) => setTimeout(resolve, 200))
    ]).then(([challenge, _]) => provider.signMessage(challenge.text, ownerAddress)
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
    })));

export {
  getValidationRequest
};
