import { Field, MerkleWitness, Signature, State, Struct } from "o1js";

class Signatures extends Struct({
  sig1: Signature,
  sig2: Signature,
  sig3: Signature
}) { }

class HumanIDWitness extends MerkleWitness(33) { }

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

const EmptyRoot = Field(0x21afce36daa1a2d67391072035f4555a85aea7197e5830b128f121aa382770cdn);

const requireConsistent = (humanIDv1: Field, truncatedHumanIDv1: Field) => {
  humanIDv1.sub(truncatedHumanIDv1).div(1n << 32n).assertLessThan(
    (1n << 222n) + 0x224698fc094cf91b992d30edn,
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
