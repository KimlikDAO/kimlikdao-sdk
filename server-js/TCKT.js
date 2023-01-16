import evm from "/lib/ethereum/evm";
import jsonrpc from "/lib/api/jsonrpc";

/**
 * @const {string}
 * @noinline
 */
const TCKT_ADDR = "0xcCc0F938A2C94b0fFBa49F257902Be7F56E62cCc";

/**
 * @constructor
 *
 * @param {!Object<string, string>} nodeUrls
 */
function TCKT(nodeUrls) {
  /** @const {!Object<string, string>} */
  this.nodeUrls = nodeUrls;
}

/**
 * Note exposure reports are filed only on Avalanche C-chain therefore this
 * method does not take a `chainId`.
 *
 * @param {string} exposureReportID of length 64, hex encoded exposureReportID.
 * @return {!Promise<number>} the timestamp of the last exposure report or zero.
 */
TCKT.prototype.exposureReported = function (exposureReportID) {
  return jsonrpc.call(this.nodeUrls["0xa86a"], 'eth_call', [
    /** @type {eth.Transaction} */({
      to: TCKT_ADDR,
      data: "0x72797221" + exposureReportID
    }), "latest"
  ]).then((hexValue) => parseInt(hexValue, 16));
}

/**
 * Given an EVM address, find the most recent revoke timestamp across all
 * supported chains.
 *
 * @param {string} address
 * @return {!Promise<number>} the last revoke timestamp.
 */
TCKT.prototype.lastRevokeTimestamp = function (address) {
  /** @const {!Array<Promise<number>>} */
  const promises = Object.values(this.nodeUrls).map((nodeUrl) =>
    jsonrpc.call(nodeUrl, 'eth_call', [
        /** @type {!eth.Transaction} */({
        to: TCKT_ADDR,
        data: "0x6a0d104e" + evm.address(address)
      }), "latest"
    ]).then((hexValue) => parseInt(hexValue, 16))
  );

  return Promise.all(promises)
    .then((values) => Math.max(...values));
}

/**
 * @param {string} chainId
 * @param {string} address
 * @return {!Promise<string>} the IPFS handle of the address, encoded as a 
 *                           length 66 hex string.
 */
TCKT.prototype.handleOf = function (chainId, address) {
  return /** @type {!Promise<string>} */(jsonrpc.call(this.nodeUrls[chainId],
    'eth_call', [
    /** @type {eth.Transaction} */({
      to: TCKT_ADDR,
      data: "0x8a591c8a" + evm.address(address)
    }), "latest"
  ]));
}

export { TCKT };
