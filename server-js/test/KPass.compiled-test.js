import { KPass } from "../KPass";
import { ChainId } from "/lib/crosschain/chains";
import { assertEq } from "/lib/testing/assert";

const testHandleOf = () => {
  const kpass = new KPass({
    [ChainId.xa86a]: "https://api.avax.network/ext/bc/C/rpc"
  });
  return kpass.handleOf(ChainId.xa86a, "0x9697bde39a925ee3feb7a1d6230b00fbed99fd31")
    .then((handle) =>
      assertEq(handle, "0xa56d70606509f963753cf6079c736def8f26823a2c544fd70eab41faf82d4a25"))
    .catch(console.log);
}

const testLastRevokeTimestamp = () => {
  const kpass = new KPass({
    [ChainId.xa86a]: "https://api.avax.network/ext/bc/C/rpc"
  });
  return kpass.lastRevokeTimestamp("0x79883d9acbc4abac6d2d216693f66fcc5a0bcbc1")
    .then((timestamp) =>
      assertEq(timestamp, 1687827423))
    .catch(console.log);
}

testHandleOf();
testLastRevokeTimestamp();
