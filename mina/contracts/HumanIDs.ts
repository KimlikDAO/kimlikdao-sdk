import {
  Field,
  MerkleWitness,
  SmartContract,
  State,
  method,
  state,
} from "o1js";

class MerkleWitness128 extends MerkleWitness(128) { }

class HumanIDs extends SmartContract {
  @state(Field) treeRoot = State<Field>();

  @method async initRoot(root: Field) {
    this.treeRoot.set(root);
  }

  @method async addHumanID(
    humanID: Field,
    leafWitness: MerkleWitness128,
  ) {
    const currentTreeRoot = this.treeRoot.getAndRequireEquals();

    // TODO(oemerfurkan): Validate that the witness path matches a prefix of the
    // provided humanID

    // humanId.sub(leafWitness.calculateIndex().mul(Field(2n ** 127n))).toBits(127);

    currentTreeRoot.assertEquals(leafWitness.calculateRoot(Field(0)));
    this.treeRoot.set(leafWitness.calculateRoot(Field(1)));
  }
}

export { HumanIDs, MerkleWitness128 };
