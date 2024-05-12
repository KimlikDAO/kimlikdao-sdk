import {
  Field,
  SmartContract,
  State,
  method,
  state
} from "o1js";
import { EmptyRoot, HumanIDWitness, Signatures, acceptHumanIDv1 } from "../humanIDv1";

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

  @method async claimReward(
    humanIDv1: Field,
    sigs: Signatures,
    witness: HumanIDWitness,
  ) {
    acceptHumanIDv1(humanIDv1, sigs, this.treeRoot, witness);
  }
}

export { Airdrop };