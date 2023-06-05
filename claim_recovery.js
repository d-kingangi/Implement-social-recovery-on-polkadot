const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
const { formatBalance } = require('@polkadot/util/format')
require("dotenv").config()

const main = async () => {
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // 1. Initialize accounts
  const Alice = keyring.addFromUri(process.env.ALICE_MNEMONIC);
  const AliceProxy = keyring.addFromUri(process.env.PROXY_MNEMONIC);

  // 2. Claim lost account
  const txHash = await api.tx.recovery
    .claimRecovery(Alice.address)
    .signAndSend(AliceProxy);
  console.log(`claimRecovery tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => { console.error(err) }).finally(() => process.exit());