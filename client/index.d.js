/**
 * @fileoverview
 *
 * @author KimlikDAO
 * @externs
 */

/**
 * @const
 */
const KimlikDAO = function () { };

/** @typedef {string} */
const ChainId = {};

/**
 * Given a list of `did.Section` names, requests the user to decrypt the
 * info sections and prepares the request to be sent for validation to
 * the remote `Validator`.
 *
 * @param {!Provider} provider
 * @param {string} chainId
 * @param {string} didContract
 * @param {string} ownerAddress
 * @param {!eth.ERC721Unlockable} tcktNft
 * @param {!Array<string>} sectionNames
 * @param {(function(!did.DecryptedSections):(
*   !kimlikdao.Challenge|
*   !Promise<!kimlikdao.Challenge>))=} getChallenge
 * @return {Promise<!kimlikdao.ValidationRequest>}
 */
KimlikDAO.prototype.getValidationRequest;
