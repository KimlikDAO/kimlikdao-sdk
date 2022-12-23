import evm from "/lib/ethereum/evm";

/**
 * @const {string}
 * @noinline
 */
export const TCKT_ADDR = "0xcCc0F938A2C94b0fFBa49F257902Be7F56E62cCc";

/**
 * @const {string}
 * @noinline
 */
export const TCKT_SIGNERS = "0xcCc09aA0d174271259D093C598FCe9Feb2791cCc";

/**
 * @constructor
 *
 * @param {!Object<string, string>} nodeUrls
 */
function TCKT(nodeUrls) {
  this.nodeUrls = nodeUrls;
}

const jsonRpcCall = (url, method, params) => fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(/** @type {jsonrpc.Request} */({
    jsonrpc: '2.0',
    id: 1,
    method,
    params
  }))
}).then((res) => res.ok ? res.json() : Promise.reject())
  .then((/** @type {jsonrpc.Response} */ res) => res.result || Promise.reject());

/**
 * Note exposure reports are filed only on Avalanche C-chain therefore this
 * method does not take a `chainId`.
 *
 * @param {string} exposureReportID of length 64, hex encoded exposureReportID.
 * @return {Promise<number>} the timestamp of the last exposure report or zero.
 */
TCKT.prototype.exposureReported = function (exposureReportID) {
  return jsonRpcCall(this.nodeUrls["0xa86a"], 'eth_call', [
    /** @type {eth.Transaction} */({
      to: TCKT_ADDR,
      data: "0x72797221" + exposureReportID
    }), "latest"
  ]);
}

/**
 * @param {string} address
 * @return {number}
 */
TCKT.lastRevokeTimestamp = function (address) {
  return 0;
}

/**
 * @param {string} chainId
 * @param {string} address
 * @return {Promise<string>} the IPFS handle of the address, encoded as a 
 *                           length 66 hex string.
 */
TCKT.prototype.handleOf = function (chainId, address) {
  return jsonRpcCall(this.nodeUrls[chainId], 'eth_call', [
    /** @type {eth.Transaction} */({
      to: TCKT_ADDR,
      data: "0x8a591c8a" + evm.address(address)
    }), "latest"
  ]);
}

export { TCKT };
