import { TCKT } from "../TCKT";
import { assertEq, assertStats } from "/lib/testing/assert";

const testHandleOf = () => {
  const tckt = new TCKT({
    "0xa86a": "https://api.avax.network/ext/bc/C/rpc"
  });
  return tckt.handleOf("0xa86a", "0x79883d9acbc4abac6d2d216693f66fcc5a0bcbc1")
    .then((handle) => {
      assertEq(handle, "0x2774f8c7b06222930975f4ec2c79e577ee1de237516496e2a444d117d845848e");
      assertStats();
    });
}

testHandleOf();
