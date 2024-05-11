import { Field, Provable, Struct } from "o1js";

/**
 * We work with BSTs with a height bound of 12. These tree can support at most
 * 4096 in the best case.
 *
 * With adverserial insertions, it can be made to fail at 14th insertion.
 *
 * @const {number}
 */
const LEN = 12;
const KEY_LIMIT = Field(2n ** 250n);

class Witness extends Struct({
  parentVal: Provable.Array(Field, LEN),
  siblingHash: Provable.Array(Field, LEN),
}) { }

/**
 * Given an purported BST path, returns true if the path is a valid BST path
 * throws otherwise.
 *
 * @param vals Root to leaf path of values
 */
const isPathValid = (vals: Field[]) => {
  let hi = KEY_LIMIT;
  let lo = Field(0);
  let pr = vals[0];
  for (let i = 1; i < LEN; ++i) {
    const mi = vals[i];
    const zero = mi.equals(0);
    const notZero = zero.not();
    zero.or(lo.lessThan(mi)).assertTrue();
    mi.assertLessThan(hi);
    notZero.and(mi.equals(pr)).assertFalse();
    const rightStep = pr.lessThan(mi).and(notZero);
    const leftStep = (rightStep.or(zero)).not();
    lo = lo.add(rightStep.toField().mul(pr.sub(lo)));
    hi = hi.sub(leftStep.toField().mul(hi.sub(pr)));
    pr = mi;
  }
  return true;
}

export {
  KEY_LIMIT,
  LEN,
  Witness,
  isPathValid
};
