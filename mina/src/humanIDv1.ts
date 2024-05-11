import { State, Field, MerkleWitness } from "o1js";

class HumanIDWitness extends MerkleWitness(32) { }

const authenticate = (treeRoot: State<Field>, humanIDv1: Field, witness: HumanIDWitness) => {
  const currentTreeRoot = treeRoot.getAndRequireEquals();
  currentTreeRoot.assertEquals(witness.calculateRoot(Field(0)));
  treeRoot.set(witness.calculateRoot(Field(1)));
}

export { authenticate, HumanIDWitness };
