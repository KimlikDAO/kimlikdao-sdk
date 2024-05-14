import {
  Field,
  MerkleWitness,
  Poseidon,
  PrivateKey,
  PublicKey,
  Signature,
  State,
  Struct,
} from "o1js";

class Signatures extends Struct({
  sig0: Signature,
  sig1: Signature,
  sig2: Signature,
}) { }

const Nodes = [
  PrivateKey.fromBigInt(1n).toPublicKey(),
  PrivateKey.fromBigInt(2n).toPublicKey(),
  PrivateKey.fromBigInt(3n).toPublicKey(),
];

class HumanIDWitness extends MerkleWitness(33) { }

const addToMerkleTree = (treeRoot: State<Field>, witness: HumanIDWitness) => {
  const currentTreeRoot = treeRoot.getAndRequireEquals();
  currentTreeRoot.assertEquals(
    witness.calculateRoot(Field(0)),
    "HumanID already exists in the set"
  );
  treeRoot.set(witness.calculateRoot(Field(1)));
};

const authenticate = (
  claimant: PublicKey,
  humanIDv1: Field,
  commitmentR: Field,
  sigs: Signatures,
) => {
  const commitment = Poseidon.hash([commitmentR, claimant.x.add(claimant.isOdd.toField())]);
  sigs.sig0.verify(Nodes[0], [humanIDv1, commitment]).assertTrue();
  sigs.sig1.verify(Nodes[1], [humanIDv1, commitment]).assertTrue();
  sigs.sig2.verify(Nodes[2], [humanIDv1, commitment]).assertTrue();
};

const EmptyRoot =
  Field(0x21afce36daa1a2d67391072035f4555a85aea7197e5830b128f121aa382770cdn);

const Inverse2Exp32 =
  Field(0x3fffffffc00000000000000000000000224698fbe706601f8fe037d166d2cf14n);

const requireConsistent = (humanIDv1: Field, truncatedHumanIDv1: Field) => humanIDv1
  .sub(truncatedHumanIDv1)
  .mul(Inverse2Exp32)
  .assertLessThan(
    (1n << 222n) + 0x224698fc094cf91b992d30edn,
    "HumanID does not match the witness"
  );

const acceptHumanIDv1 = (
  claimant: PublicKey,
  humanIDv1: Field,
  commitmentR: Field,
  sigs: Signatures,
  treeRoot: State<Field>,
  witness: HumanIDWitness,
) => {
  authenticate(claimant, humanIDv1, commitmentR, sigs);
  requireConsistent(humanIDv1, witness.calculateIndex());
  addToMerkleTree(treeRoot, witness);
};

export {
  EmptyRoot,
  HumanIDWitness,
  Nodes,
  Signatures,
  acceptHumanIDv1,
  addToMerkleTree,
  authenticate,
  requireConsistent
};
