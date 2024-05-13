import {
  AccountUpdate,
  Field,
  MerkleTree,
  Mina,
  PrivateKey,
  Signature,
  UInt64
} from "o1js";
import { HumanIDWitness, Signatures } from "../humanIDv1";
import { Airdrop } from "./Airdrop";

describe('Example Airdrop zkApp', () => {
  const deployerKey = PrivateKey.random();
  const deployer = deployerKey.toPublicKey();
  const senderKey = PrivateKey.random();
  const sender = senderKey.toPublicKey();
  const appKey = PrivateKey.random();
  const appAddr = appKey.toPublicKey();
  const sigs = new Signatures({
    sig1: Signature.create(senderKey, [Field(1)]),
    sig2: Signature.create(senderKey, [Field(2)]),
    sig3: Signature.create(senderKey, [Field(3)])
  });
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
      return app.claimReward(Field(100), sigs, new HumanIDWitness(tree.getWitness(100n)));
    }).then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  });

  it('should let 2 people claimReward()', async () => {
    await deploy();
    await fundZkApp();

    const id1 = 123123123123123123123123123123n;
    const truncatedId1 = id1 % (1n << 32n);
    await Mina.transaction(
      sender,
      () => app.claimReward(Field(id1), sigs, new HumanIDWitness(tree.getWitness(truncatedId1)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    tree.setLeaf(truncatedId1, Field(1));

    const id2 = 123123123123123123123123123124n;
    const truncatedId2 = id2 % (1n << 32n);
    await Mina.transaction(
      sender,
      () => app.claimReward(Field(id2), sigs, new HumanIDWitness(tree.getWitness(truncatedId2)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  });

  it('should reject inconsistent witness', async () => {
    await deploy();
    await fundZkApp();

    await expect(() => Mina.transaction(
      sender,
      () => app.claimReward(Field(123123123123123n), sigs, new HumanIDWitness(tree.getWitness(100n)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send())).rejects.toThrow(/does not match the witness/);
  })

  it('should not let double claimReward()', async () => {
    await deploy();
    await fundZkApp();

    await Mina.transaction(
      sender,
      () => app.claimReward(Field(100), sigs, new HumanIDWitness(tree.getWitness(100n)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    tree.setLeaf(100n, Field(1));

    await expect(() => Mina.transaction(
      sender,
      () => app.claimReward(Field(100), sigs, new HumanIDWitness(tree.getWitness(100n)))
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
      () => app.claimReward(Field(100), sigs, new HumanIDWitness(tree.getWitness(100n)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    let secondBalance = Mina.getBalance(sender);

    expect(secondBalance.sub(firstBalance)).toEqual(UInt64.from(10 * 1e9));
  })
});
