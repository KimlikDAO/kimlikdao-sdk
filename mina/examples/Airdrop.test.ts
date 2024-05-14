import {
  AccountUpdate,
  Field,
  MerkleTree,
  Mina,
  PrivateKey,
  UInt64
} from "o1js";
import { HumanIDWitness } from "../humanIDv1";
import { signHumanIDv1, truncateHumanIDv1 } from "../humanIDv1.test";
import { Airdrop } from "./Airdrop";

describe('Example Airdrop zkApp', () => {
  const deployerKey = PrivateKey.random();
  const deployer = deployerKey.toPublicKey();
  const senderKey = PrivateKey.random();
  const sender = senderKey.toPublicKey();
  const appKey = PrivateKey.random();
  const appAddr = appKey.toPublicKey();
  let tree: MerkleTree;
  let app: Airdrop;

  beforeAll(() => Airdrop.compile());

  beforeEach(() => Mina.LocalBlockchain({ proofsEnabled: true })
    .then((local) => {
      tree = new MerkleTree(33);
      Mina.setActiveInstance(local);
      app = new Airdrop(appAddr);
      local.addAccount(deployer, "100000000000");
      local.addAccount(sender, "100000000000");
    }));

  const getWitnessAndInsert = (humanIDv1Key: bigint) => {
    const truncated = truncateHumanIDv1(humanIDv1Key);
    const witness = new HumanIDWitness(tree.getWitness(truncated));
    tree.setLeaf(truncated, Field(1));
    return witness;
  }

  const fundZkApp = () => Mina.transaction(sender, async () => {
    let senderUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    senderUpdate.send({ to: appAddr, amount: 100 * 1e9 });
  }).then((txn) => txn.prove())
    .then((txn) => txn.sign([senderKey]).send());

  const deploy = () => Mina.transaction(deployer, () => {
    AccountUpdate.fundNewAccount(deployer);
    return app.deploy()
  }).then((txn) => txn.prove())
    .then((txn) => txn.sign([deployerKey, appKey]).send())

  it('should deploy the app and fund it', async () => {
    await deploy();
    await fundZkApp();
    console.log('Deployed HumanIDs contract at', app.address);
  });

  it('should let people claimReward()', async () => {
    await deploy();
    await fundZkApp()

    await Mina.transaction(sender, () => {
      return app.claimReward(...signHumanIDv1(100n, sender), getWitnessAndInsert(100n));
    }).then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  });

  it('should let 2 people claimReward()', async () => {
    await deploy();
    await fundZkApp();

    const id1 = 123123123123123123123123123123n;
    await Mina.transaction(
      sender,
      () => app.claimReward(...signHumanIDv1(id1, sender), getWitnessAndInsert(id1))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    const id2 = 123123123123123123123123123124n;
    await Mina.transaction(
      sender,
      () => app.claimReward(...signHumanIDv1(id2, sender), getWitnessAndInsert(id2))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  });

  it('should reject inconsistent witness', async () => {
    await deploy();
    await fundZkApp();

    const id = 123123123123123123123123123124n;
    expect(() => Mina.transaction(
      sender,
      () => app.claimReward(...signHumanIDv1(id, sender), getWitnessAndInsert(100n))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send())).rejects.toThrow(/does not match/);
  })

  it('should not let double claimReward()', async () => {
    await deploy();
    await fundZkApp();

    const id = 123123123123123123123123123123n;
    await Mina.transaction(
      sender,
      () => app.claimReward(...signHumanIDv1(id, sender), getWitnessAndInsert(id))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    expect(() => Mina.transaction(
      sender,
      () => app.claimReward(...signHumanIDv1(id, sender), getWitnessAndInsert(id))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send())).rejects.toThrow(/already exists/);
  })

  it('should send the reciepient 10 MINA', async () => {
    await deploy();
    await fundZkApp();

    let firstBalance = Mina.getBalance(sender);

    await Mina.transaction(
      sender,
      () => app.claimReward(...signHumanIDv1(100n, sender), getWitnessAndInsert(100n))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    let secondBalance = Mina.getBalance(sender);

    expect(secondBalance.sub(firstBalance)).toEqual(UInt64.from(10 * 1e9));
  })
});
