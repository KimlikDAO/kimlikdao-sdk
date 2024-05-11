import {
  Field,
  SmartContract,
  State,
  method,
  state
} from "o1js";
import { EmptyRoot, HumanIDWitness, Signatures, authenticate, requireUnique } from "../src/humanIDv1";

/**
 * Example airdrop zkApp, which gives 10 MINA rewards to the first 1000
 * unique humans.
 */
class Airdrop extends SmartContract {
  @state(Field) treeRoot = State<Field>();

  init() {
    super.init();
    this.treeRoot.set(EmptyRoot)
  }

  @method async initRoot(root: Field) {
    this.treeRoot.set(root);
  }

  @method async claimReward(
    humanIDv1: Field,
    sigs: Signatures,
    witness: HumanIDWitness,
  ) {
    authenticate(humanIDv1, sigs, witness.calculateIndex());
    requireUnique(this.treeRoot, witness);
  }
}

export { Airdrop };
