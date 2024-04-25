import jsonrpc from "/lib/api/jsonrpc";
import { ChainId } from "/lib/crosschain/chains";
import KPassLite from "/lib/ethereum/KPassLite";
import evm from "/lib/ethereum/evm";

/**
 * @constructor
 *
 * @param {!Object<ChainId, string>} nodeUrls
 */
function KPass(nodeUrls) {
  /** @const {!Object<ChainId, string>} */
  this.nodeUrls = nodeUrls;
}

KPass.prototype.ADDRS = KPassLite.KPASS_ADDRS;

/**
 * Note exposure reports are filed only on Avalanche C-chain therefore this
 * method does not take a `chainId`.
 *
 * @param {string} exposureReportID of length 64, hex encoded exposureReportID.
 * @return {!Promise<number>} the timestamp of the last exposure report or zero.
 */
KPass.prototype.exposureReported = function (exposureReportID) {
  return jsonrpc.call(this.nodeUrls[ChainId.x144], 'eth_call', [
    /** @type {!eth.Transaction} */({
      to: KPassLite.getAddress(ChainId.x144),
      data: "0x72797221" + exposureReportID
    }), "latest"
  ]).then((/** @type {string} */ hexValue) => parseInt(hexValue.slice(-10), 16));
}

/**
 * Given an EVM address, find the most recent revoke timestamp across all
 * supported chains.
 *
 * @param {string} address
 * @return {!Promise<number>} the last revoke timestamp.
 */
KPass.prototype.lastRevokeTimestamp = function (address) {
  /** @const {!Array<Promise<number>>} */
  const promises = Object.entries(this.nodeUrls).map(([/** ChainId */ chainId, nodeUrl]) =>
    jsonrpc.call(nodeUrl, 'eth_call', [
      /** @type {!eth.Transaction} */({
        to: KPassLite.getAddress(chainId),
        data: "0x6a0d104e" + evm.address(address)
      }), "latest"
    ]).then((/** @type {string} */ hexValue) => parseInt(hexValue.slice(-10), 16))
  );

  return Promise.all(promises)
    .then((values) => Math.max(...values));
}

/**
 * @param {ChainId} chainId
 * @param {string} address
 * @return {!Promise<string>} the IPFS handle of the address, encoded as a 
 *                            length 66 hex string.
 */
KPass.prototype.handleOf = function (chainId, address) {
  return /** @type {!Promise<string>} */(jsonrpc.call(this.nodeUrls[chainId],
    'eth_call', [
    /** @type {!eth.Transaction} */({
      to: KPassLite.getAddress(chainId),
      data: "0xc50a1514" + evm.address(address)
    }), "latest"
  ]));
}

export { KPass };
