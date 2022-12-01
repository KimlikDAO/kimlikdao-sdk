import { assert, assertSetEq, assertStats } from "/lib/testing/assert"

/** @const {!ERC721Unlockable} */
const NFT = /** @type {!ERC721Unlockable} */({
  unlockables: {
    "a": { userPrompt: "a" },
    "a,b": { userPrompt: "a,b" },
    "a,b,c": { userPrompt: "a,b,c" },
    "a,b,c,d": { userPrompt: "a,b,c,d" },
    "b,c,d": { userPrompt: "b,c,d" },
    "c,d": { userPrompt: "c,d" },
    "c,d,e": { userPrompt: "c,d,e" }
  }
});

const get = (infoSections) =>
  kimlikdao.selectUnlockables(NFT, infoSections).map((e) => e.userPrompt);

const testSimple = () => {
  assertSetEq(get(["a"]), ["a"]);
  assertSetEq(get(["b"]), ["a,b"]);
  assertSetEq(get(["c"]), ["c,d"]);
  assertSetEq(get(["d"]), ["c,d"]);
  assertSetEq(get(["e"]), ["c,d,e"]);
}

const testSingleUnlockable = () => {
  assertSetEq(get(["a", "b"]), ["a,b"]);
  assertSetEq(get(["b", "c"]), ["a,b,c"]);
  assertSetEq(get(["b", "c", "d"]), ["b,c,d"]);
  assertSetEq(get(["c", "e"]), ["c,d,e"]);
  assertSetEq(get(["a", "d"]), ["a,b,c,d"]);
}

const testTwoUnlockables = () => {
  assertSetEq(get(["a", "e"]), ["a", "c,d,e"]);
  assertSetEq(get(["b", "e"]), ["a,b", "c,d,e"]);
}

testSimple();
testSingleUnlockable();
testTwoUnlockables();
assertStats();
