import {
  Field,
  SmartContract,
  State,
  method,
  state,
} from "o1js";
import {
  EmptyRoot,
  HumanIDWitness,
  Signatures,
  acceptHumanIDv1,
} from "../humanIDv1";

const MINA = 1e9;

/**
 * Example airdrop zkApp, which gives 10 MINA rewards to each unique human.
 */
class Airdrop extends SmartContract {
  @state(Field) treeRoot = State<Field>();

  init() {
    super.init();
    this.treeRoot.set(EmptyRoot);
  }

  @method async claimReward(
    humanIDv1: Field,
    commitmentR: Field,
    sigs: Signatures,
    witness: HumanIDWitness,
  ) {
    const sender = this.sender.getUnconstrained();
    acceptHumanIDv1(sender, humanIDv1, commitmentR, sigs, this.treeRoot, witness);
    this.send({ to: sender, amount: 10 * MINA });
  }
}

export { Airdrop };
