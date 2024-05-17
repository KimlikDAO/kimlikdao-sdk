import { method } from "o1js";
import { HumanIDv1, HumanIDv1Witness, PerHumanIDv1Contract } from "../HumanIDv1";

const MINA = 1e9;

/**
 * Example airdrop zkApp, which gives 10 MINA rewards to each unique human.
 */
class Airdrop extends PerHumanIDv1Contract {
  @method async claimReward(humanIDv1: HumanIDv1, witness: HumanIDv1Witness) {
    const sender = this.sender.getUnconstrained();
    this.acceptHumanIDv1(sender, humanIDv1, witness);
    this.send({ to: sender, amount: 10 * MINA });
  }
}

export { Airdrop };
