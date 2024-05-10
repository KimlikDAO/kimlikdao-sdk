import {
  AccountUpdate,
  MerkleTree,
  Mina,
  PrivateKey
} from "o1js";
import { HumanIDs } from "./HumanIDs";

describe('HumanIDs', () => {
  const deployerKey = PrivateKey.random();
  const deployer = deployerKey.toPublicKey();
  const senderKey = PrivateKey.random();
  const sender = senderKey.toPublicKey();
  const appKey = PrivateKey.random();
  const appAddr = appKey.toPublicKey();
  let app: HumanIDs;

  beforeAll(() => HumanIDs.compile());

  beforeEach(() => Mina.LocalBlockchain({ proofsEnabled: true })
    .then((local) => {
      Mina.setActiveInstance(local);
      app = new HumanIDs(appAddr);
      local.addAccount(deployer, "1000000000");
    }));

  it('should deploy the app', async () => {
    const tree = new MerkleTree(128);

    await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      return app.deploy()
        .then(() => app.initRoot(tree.getRoot()));
    }).then((txn) => txn.prove())
      .then((txn) => txn.sign([deployerKey, appKey]).send())
      .then((txn) => txn.wait());

    console.log('Deployed HumanIDs contract at', app.address);
  });
});
