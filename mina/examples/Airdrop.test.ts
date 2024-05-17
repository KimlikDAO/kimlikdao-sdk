import { Field, MerkleTree, Mina, PrivateKey, PublicKey, UInt64 } from "o1js";
import { HumanIDv1Witness } from "../HumanIDv1";
import { signHumanIDv1, truncateHumanIDv1 } from "../HumanIDv1.test";
import { Airdrop } from "./Airdrop";

describe("Example Airdrop zkApp", () => {
  let tree: MerkleTree;
  let senderKey: PrivateKey;
  let appKey: PrivateKey;
  let sender: PublicKey;
  let app: Airdrop;

  beforeAll(() => Airdrop.compile());

  beforeEach(() =>
    Mina.LocalBlockchain({ proofsEnabled: true }).then((local) => {
      tree = new MerkleTree(33);
      Mina.setActiveInstance(local);
      senderKey = local.testAccounts[0].key;
      sender = senderKey.toPublicKey();
      appKey = local.testAccounts[1].key;
      app = new Airdrop(appKey.toPublicKey());

      const deployerKey = local.testAccounts[2].key;
      const deployer = deployerKey.toPublicKey();
      return Mina.transaction(deployer, () => app.deploy())
        .prove()
        .sign([appKey, deployerKey])
        .send();
    })
  );

  const getWitnessAndInsert = (humanIDv1Key: bigint) => {
    const truncated = truncateHumanIDv1(humanIDv1Key);
    const witness = new HumanIDv1Witness(tree.getWitness(truncated));
    tree.setLeaf(truncated, Field(1));
    return witness;
  };

  it("should deploy the app", () =>
    console.log("Deployed HumanIDs contract at", app.address.toBase58()));

  it("should let people claimReward()", () =>
    Mina.transaction(sender, () =>
      app.claimReward(signHumanIDv1(100n, sender), getWitnessAndInsert(100n))
    )
      .prove()
      .sign([senderKey])
      .send());

  it("should let 2 people claimReward()", async () => {
    const id1 = 123123123123123123123123123123n;
    await Mina.transaction(sender, () =>
      app.claimReward(signHumanIDv1(id1, sender), getWitnessAndInsert(id1))
    )
      .prove()
      .sign([senderKey])
      .send();

    const id2 = 123123123123123123123123123124n;
    await Mina.transaction(sender, () =>
      app.claimReward(signHumanIDv1(id2, sender), getWitnessAndInsert(id2))
    )
      .prove()
      .sign([senderKey])
      .send();
  });

  it("should reject inconsistent witness", async () => {
    const id = 123123123123123123123123123124n;
    expect(() =>
      Mina.transaction(sender, () =>
        app.claimReward(signHumanIDv1(id, sender), getWitnessAndInsert(100n))
      )
        .prove()
        .sign([senderKey])
        .send()
    ).rejects.toThrow(/does not match/);
  });

  it("should not let double claimReward()", async () => {
    const id = 123123123123123123123123123123n;
    await Mina.transaction(sender, () =>
      app.claimReward(signHumanIDv1(id, sender), getWitnessAndInsert(id))
    )
      .prove()
      .sign([senderKey])
      .send();

    expect(() =>
      Mina.transaction(sender, () =>
        app.claimReward(signHumanIDv1(id, sender), getWitnessAndInsert(id))
      )
        .prove()
        .sign([senderKey])
        .send()
    ).rejects.toThrow(/already exists/);
  });

  it("should send the reciepient 10 MINA", async () => {
    let firstBalance = Mina.getBalance(sender);

    await Mina.transaction(sender, () =>
      app.claimReward(signHumanIDv1(100n, sender), getWitnessAndInsert(100n))
    )
      .prove()
      .sign([senderKey])
      .send();

    let secondBalance = Mina.getBalance(sender);
    expect(secondBalance.sub(firstBalance)).toEqual(UInt64.from(10 * 1e9));
  });
});
