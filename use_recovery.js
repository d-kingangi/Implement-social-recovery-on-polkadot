const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
const { formatBalance } = require('@polkadot/util/format')
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
  const AMOUNT_TO_SEND = 1000000000000;
  const displayAmount = formatBalance(AMOUNT_TO_SEND); // 1.0000 WND
  const figmentFaucet = '5Fbm5fa1W9FhoCLBu8Tak7SWJHmbj4tRNyJrPifmLAq8PGp6';

  // 3. Initialize accounts
  const Alice = keyring.addFromUri(process.env.ALICE_MNEMONIC);
  const AliceProxy = keyring.addFromUri(process.env.PROXY_MNEMONIC);

  // 4. Use asRecovered to bond 0.1 WND for our lost proxy account
  const call = await api.tx.balances.transfer(figmentFaucet, AMOUNT_TO_SEND);
  const txHash = await api.tx.recovery
    .asRecovered(Alice.address, call)
    .signAndSend(AliceProxy);
  console.log(`Required values  : asRecovered(address, function)`);     
  console.log(`Submitted values : asRecovered(${Alice.address}, ${JSON.stringify(call, null, 2)})`); 
  console.log(`asRecovered tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => { console.error(err) }).finally(() => process.exit());