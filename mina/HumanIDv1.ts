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

const Uint8denHexe: string[] = Array(255);
for (let /** number */ i = 0; i < 256; ++i)
  Uint8denHexe[i] = i.toString(16).padStart(2, "0");

const hex = (buff: Uint8Array) => {
  /** @const {!Array<string>} */
  const ikililer = new Array(buff.length);
  for (let /** number */ i = 0; i < buff.length; ++i)
    ikililer[i] = Uint8denHexe[buff[i]];
  return ikililer.join("");
}

const uint8ArrayBEtoBigInt = (bytes: Uint8Array) => BigInt("0x" + hex(bytes));

const readPublicKey = (bytes: Uint8Array) => PublicKey.from({
  x: uint8ArrayBEtoBigInt(bytes.subarray(0, 32)),
  isOdd: !!bytes[32]
});

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

const Inverse2Exp32 =
  Field(0x3fffffffc00000000000000000000000224698fbe706601f8fe037d166d2cf14n);

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
    "KimlikDAO-init": Field, // Emits the tree height along with init event
    "KimlikDAO-add-HumanIDv1": Field, // Emits the added HumanIDv1.id
  };

  @state(Field) treeRoot = State<Field>();

  init() {
    super.init();
    this.treeRoot.set(EmptyRoot);
    this.emitEvent("KimlikDAO-init", Field(32));
  }

  acceptHumanIDv1(
    owner: PublicKey,
    humanIDv1: HumanIDv1,
    witness: HumanIDv1Witness
  ) {
    authenticate(owner, humanIDv1);
    requireConsistent(humanIDv1.id, witness.calculateIndex());
    this.addToMerkleTree(witness);
    this.emitEvent("KimlikDAO-add-HumanIDv1", humanIDv1.id);
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
  readPublicKey,
  readSignature,
  requireConsistent
};

