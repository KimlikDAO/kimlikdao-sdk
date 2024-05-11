import {
  Field,
  SmartContract,
  State,
  method,
  state
} from "o1js";
import { HumanIDWitness, authenticate } from "../src/humanIDv1";

/**
 * Example airdrop zkApp, which gives 10 MINA rewards to the first 1000
 * unique humans.
 */
class Airdrop extends SmartContract {
  @state(Field) treeRoot = State<Field>();

  @method async initRoot(root: Field) {
    this.treeRoot.set(root);
  }

  @method async claimReward(
    humanIDv1: Field,
    witness: HumanIDWitness,
  ) {
    authenticate(this.treeRoot, humanIDv1, witness);
  }
}

export { Airdrop };
