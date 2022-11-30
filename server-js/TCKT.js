import evm from "/lib/ethereum/evm";

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
  return fetch(nodeUrls[chainId], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [({
        to: "0xcCc0E26339e393e51a3f46fB45d0e6f95ca32cCc",
        data: "0x72797221" + humanId
      }), "latest"]
    })
  }).then((res) => res.statusText == "OK" ? res.json().then((data) => data.result) : Promise.reject())
}

/**
 * @param {string} chainId
 * @param {string} address
 * @return {Promise<number>}
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
  return fetch(nodeUrls[chainId], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [({
        to: "0xcCc0E26339e393e51a3f46fB45d0e6f95ca32cCc",
        data: "0x8a591c8a" + evm.address(address)
      }), "latest"]
    })
  }).then((res) => res.statusText == "OK" ? res.json().then((data) => data.result) : Promise.reject())
}

export default TCKT;
