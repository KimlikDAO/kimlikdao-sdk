import { Field, MerkleWitness, Signature, State, Struct } from "o1js";

class Signatures extends Struct({
  sig1: Signature,
  sig2: Signature,
  sig3: Signature
}) { }

class HumanIDWitness extends MerkleWitness(16) { }

const requireUnique = (treeRoot: State<Field>, witness: HumanIDWitness) => {
  const currentTreeRoot = treeRoot.getAndRequireEquals();
  currentTreeRoot.assertEquals(
    witness.calculateRoot(Field(0)),
    "HumanID already exists in the set"
  );
  treeRoot.set(witness.calculateRoot(Field(1)));
}

const authenticate = (humanIDv1: Field, sigs: Signatures, truncatedHumanID: Field) => {
  // TODO(KimlikDAO-bot)
  return true;
}

const EmptyRoot = Field(0xccdd9994da4ffb1d39fcdf50d2c2c6240c423d6ec332865eea991c7bf1e5a9cn);

export { EmptyRoot, HumanIDWitness, Signatures, authenticate, requireUnique };
