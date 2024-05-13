import {
  AccountUpdate,
  Bool,
  Field,
  MerkleTree,
  Mina,
  PrivateKey,
  Signature,
  UInt64
} from "o1js";
import { HumanIDWitness, Signatures, authenticate } from "../humanIDv1";
import { Airdrop } from "./Airdrop";

describe('Example Airdrop zkApp', () => {
  const deployerKey = PrivateKey.random();
  const deployer = deployerKey.toPublicKey();
  const senderKey = PrivateKey.random();
  const sender = senderKey.toPublicKey();
  const appKey = PrivateKey.random();
  const appAddr = appKey.toPublicKey();
  const id1 = Field(1);
  const id2 = Field(2);
  const privKey1 = PrivateKey.fromBigInt(1n);
  const privKey2 = PrivateKey.fromBigInt(2n);
  const privKey3 = PrivateKey.fromBigInt(3n);
  const sigs = new Signatures({
    sig1: Signature.create(privKey1, [Field(100), sender.x.add(sender.isOdd.toField())]),
    sig2: Signature.create(privKey2, [Field(100), sender.x.add(sender.isOdd.toField())]),
    sig3: Signature.create(privKey3, [Field(100), sender.x.add(sender.isOdd.toField())])
  });
  const sigs1 = new Signatures({
    sig1: Signature.create(privKey1, [id1, sender.x.add(sender.isOdd.toField())]),
    sig2: Signature.create(privKey2, [id1, sender.x.add(sender.isOdd.toField())]),
    sig3: Signature.create(privKey3, [id1, sender.x.add(sender.isOdd.toField())])
  });
  const sigs2 = new Signatures({
    sig1: Signature.create(privKey1, [id2, sender.x.add(sender.isOdd.toField())]),
    sig2: Signature.create(privKey2, [id2, sender.x.add(sender.isOdd.toField())]),
    sig3: Signature.create(privKey3, [id2, sender.x.add(sender.isOdd.toField())])
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

  it('should verify signatures', () => {
    authenticate(id1, sigs1, sender);
    authenticate(id2, sigs2, sender);
  })

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
    const truncatedId1 = id1 & 0xFFFFFFFFn;
    const sigsTest1 = new Signatures({
      sig1: Signature.create(privKey1, [Field(id1), sender.x.add(sender.isOdd.toField())]),
      sig2: Signature.create(privKey2, [Field(id1), sender.x.add(sender.isOdd.toField())]),
      sig3: Signature.create(privKey3, [Field(id1), sender.x.add(sender.isOdd.toField())])
    });
    await Mina.transaction(
      sender,
      () => app.claimReward(Field(id1), sigsTest1, new HumanIDWitness(tree.getWitness(truncatedId1)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    tree.setLeaf(truncatedId1, Field(1));

    const id2 = 123123123123123123123123123124n;
    const truncatedId2 = id2 & 0xFFFFFFFFn;
    const sigsTest2 = new Signatures({
      sig1: Signature.create(privKey1, [Field(id2), sender.x.add(sender.isOdd.toField())]),
      sig2: Signature.create(privKey2, [Field(id2), sender.x.add(sender.isOdd.toField())]),
      sig3: Signature.create(privKey3, [Field(id2), sender.x.add(sender.isOdd.toField())])
    });
    await Mina.transaction(
      sender,
      () => app.claimReward(Field(id2), sigsTest2, new HumanIDWitness(tree.getWitness(truncatedId2)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  });

  it('should reject inconsistent witness', async () => {
    await deploy();
    await fundZkApp();

    const sigsTest3 = new Signatures({
      sig1: Signature.create(privKey1, [Field(123123123123123n), sender.x.add(sender.isOdd.toField())]),
      sig2: Signature.create(privKey2, [Field(123123123123123n), sender.x.add(sender.isOdd.toField())]),
      sig3: Signature.create(privKey3, [Field(123123123123123n), sender.x.add(sender.isOdd.toField())])
    });
    await expect(() => Mina.transaction(
      sender,
      () => app.claimReward(Field(123123123123123n), sigsTest3, new HumanIDWitness(tree.getWitness(100n)))
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
