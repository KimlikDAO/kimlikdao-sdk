import {
  AccountUpdate,
  Field,
  MerkleTree,
  Mina,
  PrivateKey,
  Signature
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
      tree = new MerkleTree(17);
      Mina.setActiveInstance(local);
      app = new Airdrop(appAddr);
      local.addAccount(deployer, "1000000000");
      local.addAccount(sender, "1000000000");
    }));

  const deploy = () => Mina.transaction(deployer, async () => {
    AccountUpdate.fundNewAccount(deployer);
    return app.deploy()
  }).then((txn) => txn.prove())
    .then((txn) => txn.sign([deployerKey, appKey]).send())

  it('should deploy the app', async () => {
    await deploy();
    console.log('Deployed HumanIDs contract at', app.address);
  });

  it('should let people claimReward()', async () => {
    await deploy();

    await Mina.transaction(sender, () => {
      return app.claimReward(Field(100), sigs, new HumanIDWitness(tree.getWitness(100n)));
    }).then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  });

  it('should let 2 people claimReward()', async () => {
    await deploy();

    await Mina.transaction(
      sender,
      () => app.claimReward(Field(100), sigs, new HumanIDWitness(tree.getWitness(100n)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());

    tree.setLeaf(100n, Field(1));

    await Mina.transaction(
      sender,
      () => app.claimReward(Field(101), sigs, new HumanIDWitness(tree.getWitness(101n)))
    )
      .then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  });

  it('should not let double claimReward()', async () => {
    await deploy();

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
});
