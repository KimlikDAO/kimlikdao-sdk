import {
  AccountUpdate,
  Field,
  MerkleTree,
  Mina,
  PrivateKey
} from "o1js";
import { Airdrop } from "./Airdrop";
import { HumanIDWitness } from "../src/humanIDv1";

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
      tree = new MerkleTree(32);
      Mina.setActiveInstance(local);
      app = new Airdrop(appAddr);
      local.addAccount(deployer, "1000000000");
      local.addAccount(sender, "1000000000");
    }));

  const deploy = () => Mina.transaction(deployer, async () => {
    AccountUpdate.fundNewAccount(deployer);
    return app.deploy()
      .then(() => app.initRoot(tree.getRoot()));
  }).then((txn) => txn.prove())
    .then((txn) => txn.sign([deployerKey, appKey]).send())

  it('should deploy the app', async () => {
    await deploy();
    console.log('Deployed HumanIDs contract at', app.address);
  });

  it('should let people claimReward()', async () => {
    await deploy();

    await Mina.transaction(sender, () => {
      let zkApp = new Airdrop(appAddr);
      return zkApp.claimReward(Field(100), new HumanIDWitness(tree.getWitness(100n)));
    }).then((txn) => txn.prove())
      .then((txn) => txn.sign([senderKey]).send());
  })
});
