
/**
 * @fileoverview A library for verifying a TCKT.
 *
 * @author KimlikDAO
 */

/**
 * @param {did.InfoSection} infoSection
 * @param {string} chainId
 * @param {string} address
 * @param {string} commitSecret
 * @return {boolean} whether the info section has a valid signature.
 */
const verifyInfoSection = (infoSection, chainId, address, commitSecret) => {
  return false;
}

/**
 * @param {did.DecryptedDID} decryptedTckt
 * @param {string} chainId
 * @param {string} address
 * @param {string} commitSecret
 * @return {boolean} whether each info section of the decrypted TCKT has a
 *                   valid signature.
 */
const verifyDecryptedTckt = (decryptedTckt, chainId, address, commitSecret) => {
  return false;
}

export default {
  verifyDecryptedTckt,
  verifyInfoSection
};
