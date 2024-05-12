import { Field, MerkleWitness, Signature, State, Struct } from "o1js";

class Signatures extends Struct({
  sig1: Signature,
  sig2: Signature,
  sig3: Signature
}) { }

class HumanIDWitness extends MerkleWitness(17) { }

const addToMerkleTree = (treeRoot: State<Field>, witness: HumanIDWitness) => {
  const currentTreeRoot = treeRoot.getAndRequireEquals();
  currentTreeRoot.assertEquals(
    witness.calculateRoot(Field(0)),
    "HumanID already exists in the set"
  );
  treeRoot.set(witness.calculateRoot(Field(1)));
}

const authenticate = (humanIDv1: Field, sigs: Signatures) => {
  // TODO(KimlikDAO-bot)
  return true;
}

const EmptyRoot = Field(0x24807cf0bfd8d61f0f431456489ca762fb4f967c7c58665e80eadd9878b3af19n);

const requireConsistent = (humanIDv1: Field, truncatedHumanIDv1: Field) => {
  humanIDv1.sub(truncatedHumanIDv1).div(65536).assertLessThan(
    (1n << 238n) + 0x224698fc094cf91b992d30ed0000n,
    "HumanID does not match the witness"
  );
}

const acceptHumanIDv1 = (
  humanIDv1: Field,
  sigs: Signatures,
  treeRoot: State<Field>,
  witness: HumanIDWitness
) => {
  authenticate(humanIDv1, sigs);
  requireConsistent(humanIDv1, witness.calculateIndex());
  addToMerkleTree(treeRoot, witness);
}

export {
  EmptyRoot,
  HumanIDWitness,
  Signatures,
  acceptHumanIDv1,
  addToMerkleTree,
  authenticate,
  requireConsistent
};
