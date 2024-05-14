import { Field, Poseidon, PrivateKey, PublicKey, Signature } from "o1js";
import { Signatures, authenticate, requireConsistent } from "./humanIDv1";

const Nodes = [
  PrivateKey.fromBigInt(1n),
  PrivateKey.fromBigInt(2n),
  PrivateKey.fromBigInt(3n),
];

const blindingCommit = (sender: PublicKey) => {
  const commitmentR = Field.random();
  return [
    commitmentR,
    Poseidon.hash([commitmentR, sender.x.add(sender.isOdd.toField())]),
  ];
};

const signHumanIDv1 = (
  humanIDv1Key: bigint,
  sender: PublicKey
): [Field, Field, Signatures] => {
  const humanIDv1 = Field(humanIDv1Key);
  const [commitmentR, commitment] = blindingCommit(sender);
  const sigs = new Signatures({
    sig0: Signature.create(Nodes[0], [humanIDv1, commitment]),
    sig1: Signature.create(Nodes[1], [humanIDv1, commitment]),
    sig2: Signature.create(Nodes[2], [humanIDv1, commitment]),
  });
  return [humanIDv1, commitmentR, sigs];
};

const truncateHumanIDv1 = (humanIDv1Key: bigint) => humanIDv1Key & 0xffffffffn;

const badSignHumanIDv1 = (
  humanIDv1Key: bigint,
  sender: PublicKey
): [Field, Field, Signatures] => {
  const humanIDv1 = Field(humanIDv1Key);
  const [commitmentR, commitment] = blindingCommit(sender);
  const sigs = new Signatures({
    sig0: Signature.create(Nodes[0], [humanIDv1, commitment]),
    sig1: Signature.create(Nodes[1], [humanIDv1, commitment]),
    sig2: Signature.create(Nodes[3], [humanIDv1, commitment]),
  });
  return [humanIDv1, commitmentR, sigs];
};

describe("humanIDv1 SDK tests", () => {
  it("should authenticate geniune humanIDv1s and reject others", () => {
    const claimant = PrivateKey.fromBigInt(0x1337n).toPublicKey();
    expect(() =>
      authenticate(claimant, ...signHumanIDv1(100n, claimant))
    ).not.toThrow();
    expect(() =>
      authenticate(claimant, ...badSignHumanIDv1(200n, claimant))
    ).toThrow();
  });

  it("should accept only matching (humanIDv1, witness) pairs", () => {
    const id1 = 98708374501874509283475982345n;
    expect(() =>
      requireConsistent(Field(id1), Field(truncateHumanIDv1(id1)))
    ).not.toThrow();
    expect(() =>
      requireConsistent(Field(id1), Field(truncateHumanIDv1(id1 + 1n)))
    ).toThrow();
  });
});

export { blindingCommit, signHumanIDv1, truncateHumanIDv1 };
