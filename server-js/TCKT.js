

/**
 * @constructor
 *
 * @param {Object<string, string>} nodeUrls
 */
function TCKT(nodeUrls) {
  this.nodeUrls = nodeUrls;
}

/**
 * Note exposure reports are filed only on Avalanche C-chain therefore this
 * method does not take a `chainId`.
 *
 * @param {string} humanId of length 66, hex encoded humanId
 * @return {Promise<number>} the timestamp of the last exposure report or zero.
 */
TCKT.prototype.exposureReported = function (humanId) {
  return 0;
}

/**
 * @param {string} chainId
 * @param {string} address
 */
TCKT.prototype.mostRecentCreate = function (chainId, address) {
  return 0;
}

/**
 * @param {string} chainId
 * @param {string} address
 * @return {Promise<string>} the IPFS handle of the address, encoded as a 
 *                           length 66 hex string.
 */
TCKT.prototype.handleOf = (chainId, address) => {
  return "";
}

export default TCKT;
