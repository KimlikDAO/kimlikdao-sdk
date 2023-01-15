import evm from "/lib/ethereum/evm";

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
function TCKTSigners(nodeUrls) {
  this.nodeUrls = nodeUrls;
}

function jsonRpcMultiCall(nodeUrl, method, params) {
  const requests = params.map(param => /** type {jsonRpc.Request} */({
    jsonrpc: "2.0",
    id: 1,
    method,
    params: param,
  }))
  return fetch(nodeUrl, { method: "POST", headers: { 'content-type': 'application/json' }, body: JSON.stringify(requests) })
    .then((res) => res.json())
}

/**
 * @param {!Array<string>} signers an array of claimed signer addresses starting with 0x.
 * @param {number} timestamp
 * @return {!Array<Promise<number>>} whether all the supplied signers were valid as of the timestamp
 */
TCKTSigners.prototype.checkAllValid = function (signers, timestamp) {
  /** @const {!Array<Promise<number>>} */
  const promises = jsonRpcMultiCall(nodeUrl['0xa86a'], 'eth_call', signers.map((signer) => {
    return [{
      "data": "2796d3f1" + evm.address(signer),
      "to": evm.address(TCKTSigners)
    }, "latest"]
  }))

  let totalDeposit = 0;
  let counter = 0;
  return Promise.all(promises).then((signersInfo) => signersInfo.map((signerInfo) => {
    const endTs = parseInt(signerInfo.slice(26, 38), 16)
    const deposit = parseInt(signerInfo.slice(38, 50), 16)
    const startTs = parseInt(signerInfo.slice(-12), 16)

    if (startTs < timestamp && (endTs == 0 || timestamp < endTs)) {
      totalDeposit += deposit;
      counter++;
    }
    return [counter, totalDeposit]

  }))
}

export { TCKTSigners }