import { uint8ArrayBEtoBigInt } from "@kimlikdao/lib/util/çevir";
import {
  Field,
  MerkleWitness,
  Poseidon,
  PrivateKey,
  PublicKey,
  Signature,
  SmartContract,
  State,
  Struct,
  state,
} from "o1js";

const readField = (bytes: Uint8Array) => Field(uint8ArrayBEtoBigInt(bytes.subarray(0, 32)));

const readSignature = (bytes: Uint8Array) => new Signature(
  readField(bytes),
  readField(bytes.subarray(32))
);

class HumanIDv1 extends Struct({
  id: Field,
  commitmentR: Field,
  sig0: Signature,
  sig1: Signature,
  sig2: Signature,
}) {
  /**
   * @param bytes Uint8Array of length 256, where each field is written in BE encoding.
   */
  static fromBytes(bytes: Uint8Array) {
    return new HumanIDv1({
      id: readField(bytes),
      commitmentR: readField(bytes.subarray(32)),
      sig0: readSignature(bytes.subarray(64)),
      sig1: readSignature(bytes.subarray(128)),
      sig2: readSignature(bytes.subarray(192))
    })
  }
}

class HumanIDv1Witness extends MerkleWitness(33) { }

const Event = Struct({ uid: Field, value: Field });

const KPassSigners = [
  PrivateKey.fromBigInt(1n).toPublicKey(),
  PrivateKey.fromBigInt(2n).toPublicKey(),
  PrivateKey.fromBigInt(3n).toPublicKey(),
];

const authenticate = (owner: PublicKey, hid: HumanIDv1) => {
  const commitment = Poseidon.hash([
    hid.commitmentR,
    owner.x.add(owner.isOdd.toField()),
  ]);
  hid.sig0.verify(KPassSigners[0], [hid.id, commitment]).assertTrue();
  hid.sig1.verify(KPassSigners[1], [hid.id, commitment]).assertTrue();
  hid.sig2.verify(KPassSigners[2], [hid.id, commitment]).assertTrue();
};

const EmptyRoot =
  Field(0x21afce36daa1a2d67391072035f4555a85aea7197e5830b128f121aa382770cdn);

// Field(1).div(Field(2 ** 32))
const Inverse2Exp32 =
  Field(0x3fffffffc00000000000000000000000224698fbe706601f8fe037d166d2cf14n);

// CircuitString.fromString("KimlikDAO-init").hash()
const InitEventUID =
  Field(0x363b52a04cf908f3357575efb35b0bf635ebb4fc2e921c140e99426fb1ef89dcn);

// CircuitString.fromString("KimlikDAO-add-HumanIDv1").hash()
const AddEventUID =
  Field(0x13c6e18cd3ba5dab50481970932ded0f7513e22ada9b77949a83dd54fc7c4e6dn);

const requireConsistent = (humanIDv1: Field, truncatedHumanIDv1: Field) =>
  humanIDv1
    .sub(truncatedHumanIDv1)
    .mul(Inverse2Exp32)
    .assertLessThan(
      (1n << 222n) + 0x224698fc094cf91b992d30edn,
      "HumanID does not match the witness"
    );

class PerHumanIDv1Contract extends SmartContract {
  events = {
    "KimlikDAO-init": Event, // Emits the tree height along with init event
    "KimlikDAO-add-HumanIDv1": Event, // Emits the added HumanIDv1.id
  };

  @state(Field) treeRoot = State<Field>();

  init() {
    super.init();
    this.treeRoot.set(EmptyRoot);
    this.emitEvent(
      "KimlikDAO-init",
      new Event({ uid: InitEventUID, value: Field(32) })
    );
  }

  acceptHumanIDv1(
    owner: PublicKey,
    humanIDv1: HumanIDv1,
    witness: HumanIDv1Witness
  ) {
    authenticate(owner, humanIDv1);
    requireConsistent(humanIDv1.id, witness.calculateIndex());
    this.addToMerkleTree(witness);
    this.emitEvent(
      "KimlikDAO-add-HumanIDv1",
      new Event({ uid: AddEventUID, value: humanIDv1.id })
    );
  }

  addToMerkleTree(witness: HumanIDv1Witness) {
    const currentTreeRoot = this.treeRoot.getAndRequireEquals();
    currentTreeRoot.assertEquals(
      witness.calculateRoot(Field(0)),
      "HumanID already exists in the set"
    );
    this.treeRoot.set(witness.calculateRoot(Field(1)));
  }
}

export {
  EmptyRoot,
  HumanIDv1,
  HumanIDv1Witness,
  KPassSigners,
  PerHumanIDv1Contract,
  authenticate,
  readField,
  readSignature,
  requireConsistent
};
