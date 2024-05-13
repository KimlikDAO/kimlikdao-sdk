import {
  Field,
  MerkleWitness,
  PrivateKey,
  PublicKey,
  Signature,
  State,
  Struct,
} from "o1js";

class Signatures extends Struct({
  sig1: Signature,
  sig2: Signature,
  sig3: Signature,
}) {}

const node1PrivKey = PrivateKey.fromBigInt(1n);
const node1PublicKey = node1PrivKey.toPublicKey();
const node2PrivKey = PrivateKey.fromBigInt(2n);
const node2PublicKey = node2PrivKey.toPublicKey();
const node3PrivKey = PrivateKey.fromBigInt(3n);
const node3PublicKey = node3PrivKey.toPublicKey();

class HumanIDWitness extends MerkleWitness(33) {}

const addToMerkleTree = (treeRoot: State<Field>, witness: HumanIDWitness) => {
  const currentTreeRoot = treeRoot.getAndRequireEquals();
  currentTreeRoot.assertEquals(
    witness.calculateRoot(Field(0)),
    "HumanID already exists in the set"
  );
  treeRoot.set(witness.calculateRoot(Field(1)));
};

const authenticate = (
  humanIDv1: Field,
  sigs: Signatures,
  claimant: PublicKey
) => {
    sigs.sig1.verify(node1PublicKey, [humanIDv1, claimant.x.add(claimant.isOdd.toField())]).assertTrue();
    sigs.sig2.verify(node2PublicKey, [humanIDv1, claimant.x.add(claimant.isOdd.toField())]).assertTrue();
    sigs.sig3.verify(node3PublicKey, [humanIDv1, claimant.x.add(claimant.isOdd.toField())]).assertTrue();
};

const EmptyRoot =
  Field(0x21afce36daa1a2d67391072035f4555a85aea7197e5830b128f121aa382770cdn);

const Inverse2Exp32 =
  Field(0x3fffffffc00000000000000000000000224698fbe706601f8fe037d166d2cf14n);

const requireConsistent = (humanIDv1: Field, truncatedHumanIDv1: Field) => {
  humanIDv1
    .sub(truncatedHumanIDv1)
    .mul(Inverse2Exp32)
    .assertLessThan(
      (1n << 222n) + 0x224698fc094cf91b992d30edn,
      "HumanID does not match the witness"
    );
};

const acceptHumanIDv1 = (
  humanIDv1: Field,
  sigs: Signatures,
  treeRoot: State<Field>,
  witness: HumanIDWitness,
  claimant: PublicKey
) => {
  authenticate(humanIDv1, sigs, claimant);
  requireConsistent(humanIDv1, witness.calculateIndex());
  addToMerkleTree(treeRoot, witness);
};

export {
  EmptyRoot,
  HumanIDWitness,
  Signatures,
  acceptHumanIDv1,
  addToMerkleTree,
  authenticate,
  requireConsistent,
};
