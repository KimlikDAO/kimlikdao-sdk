import {
  AccountUpdate,
  MerkleTree,
  Mina,
  PrivateKey
} from "o1js";
import { Airdrop } from "./Airdrop";

describe('Example Airdrop zkApp', () => {
  const deployerKey = PrivateKey.random();
  const deployer = deployerKey.toPublicKey();
  const senderKey = PrivateKey.random();
  const sender = senderKey.toPublicKey();
  const appKey = PrivateKey.random();
  const appAddr = appKey.toPublicKey();
  let app: Airdrop;

  beforeAll(() => Airdrop.compile());

  beforeEach(() => Mina.LocalBlockchain({ proofsEnabled: true })
    .then((local) => {
      Mina.setActiveInstance(local);
      app = new Airdrop(appAddr);
      local.addAccount(deployer, "1000000000");
      local.addAccount(sender, "1000000000");
    }));

  it('should deploy the app', async () => {
    const tree = new MerkleTree(32);

    await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      return app.deploy()
        .then(() => app.initRoot(tree.getRoot()));
    }).then((txn) => txn.prove())
      .then((txn) => txn.sign([deployerKey, appKey]).send())
      .then((txn) => txn.wait());

    console.log('Deployed HumanIDs contract at', app.address);
  });

  it('should let people claimReward()', async () => {
    const tree = new MerkleTree(32);

    // TODO
  })
});
