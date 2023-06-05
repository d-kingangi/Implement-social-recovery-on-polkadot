const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
const { formatBalance } = require('@polkadot/util/format')
require("dotenv").config()

const main = async () => {
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // 1. Initialize account(s)
  const Alice = keyring.addFromUri(process.env.ALICE_MNEMONIC);
  const AliceProxy = keyring.addFromUri(process.env.PROXY_MNEMONIC);
  const Bob = keyring.addFromUri(process.env.BOB_MNEMONIC);
  const Charlie = keyring.addFromUri(process.env.CHARLIE_MNEMONIC);

  // Friend 1 vouches for our recovery process
  const txHash1 = await api.tx.recovery
    .vouchRecovery(Alice.address, AliceProxy.address)
    .signAndSend(Bob);
  console.log(`Bob vouch tx: https://westend.subscan.io/extrinsic/${txHash1}`);

  // Friend 2 vouches for our recovery process
  const txHash2 = await api.tx.recovery
    .vouchRecovery(Alice.address, AliceProxy.address)
    .signAndSend(Charlie);
  console.log(`Charlie vouch tx: https://westend.subscan.io/extrinsic/${txHash2}`);
};

main().catch((err) => { console.error(err) }).finally(() => process.exit());