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
  const AMOUNT_TO_SEND = 500000000000;
  const displayAmount = formatBalance(AMOUNT_TO_SEND); // 0.5000 WND

  // 3. Initialize accounts
  const Alice = keyring.addFromUri(process.env.ALICE_MNEMONIC);
  const Bob = keyring.addFromUri(process.env.BOB_MNEMONIC);
  const Charlie = keyring.addFromUri(process.env.CHARLIE_MNEMONIC);
 
   // 4. Define an array of transactions
  const transactions = [
    api.tx.balances.transfer(Bob.address, AMOUNT_TO_SEND),
    api.tx.balances.transfer(Charlie.address, AMOUNT_TO_SEND),
  ];

   // 5. Send batch transaction
   const txHash = await api.tx.utility
   .batch(transactions)
   .signAndSend(Alice);
 console.log(`Sending ${displayAmount} to ${Bob.address} & ${Charlie.address}`);     
 console.log(`Required values  : .batch([transactions])`);     
 console.log(`Submitted values : .batch(${JSON.stringify(transactions, null, 2)})`);
 console.log(`batch() tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => { console.error(err) }).finally(() => process.exit());