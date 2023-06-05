const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
const { formatBalance } = require('@polkadot/util/format');
require("dotenv").config()

const main = async () => {
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});
  
  // 1. Use formatBalance to make the amount readable
  formatBalance.setDefaults({
    unit: 'WND',
    decimals: 12,
  })
  
  // 2. Define relevant constants  
  const AMOUNT_TO_SEND = 12000000000000; // 12 WND
  const figmentFaucet = '5Fbm5fa1W9FhoCLBu8Tak7SWJHmbj4tRNyJrPifmLAq8PGp6';

  // 3. Initialize accounts
  const Alice = keyring.addFromUri(process.env.ALICE_MNEMONIC);
  const AliceProxy = keyring.addFromUri(process.env.PROXY_MNEMONIC);
  
  // 4. Define an array of transactions
  const transactions = [
    api.tx.recovery.closeRecovery(AliceProxy.address),
    api.tx.recovery.removeRecovery(),
  ];

  // 5. Close & Remove recovery config
  const closeHash = await api.tx.utility
    .batch(transactions)
    .signAndSend(Alice, { nonce: -1 } );
  console.log(`Required values  : .batch([transactions])`);     
  console.log(`Submitted values : .batch(${JSON.stringify(transactions, null, 2)})`);
  console.log(`batch() tx: https://westend.subscan.io/extrinsic/${closeHash}`);  
  
  // 6. Refund the Faucet
  const txHash = await api.tx.balances
    .transfer(figmentFaucet, AMOUNT_TO_SEND)
    .signAndSend(Alice, { nonce: -1 });
  console.log(`transfer() tx: https://westend.subscan.io/extrinsic/${txHash}`);

};

main().catch((err) => { console.error(err) }).finally(() => process.exit());