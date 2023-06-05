const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
const { formatBalance } = require('@polkadot/util/format')
require("dotenv").config()

const main = async () => {
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // 1. Use formatBalance() to make amounts readable
  formatBalance.setDefaults({
    unit: 'WND',
    decimals: 12,
  })
  
  // 2. Define relevant constants
  const THRESHOLD = 2;
  const DELAY_PERIOD = 0;
  const DEPOSIT_BASE = api.consts.recovery.configDepositBase.toString();     // 5,000,000,000,000 = 5.00000 WND
  const DEPOSIT_FACTOR = api.consts.recovery.friendDepositFactor.toString(); //   500,000,000,000 = 0.50000 WND
  
  // 3. Initialize accounts
  const Alice = keyring.addFromUri(process.env.ALICE_MNEMONIC);
  const Bob = keyring.addFromUri(process.env.BOB_MNEMONIC);
  const Charlie = keyring.addFromUri(process.env.CHARLIE_MNEMONIC);
  const friends = [
    Bob.address,
    Charlie.address,
  ].sort(); 

  // 4. Create Recovery configuration
  const txHash = await api.tx.recovery
    .createRecovery(friends, THRESHOLD, DELAY_PERIOD)
    .signAndSend(Alice);
  console.log(`\nconfigDepositBase \+ ( friendDepositFactor * number of friends )\n : ${formatBalance(DEPOSIT_BASE)} \+ ${formatBalance(DEPOSIT_FACTOR * friends.length)} \= ${formatBalance(parseInt(DEPOSIT_BASE)+parseInt(DEPOSIT_FACTOR*friends.length))}\n`);
  console.log(`Required values : .createRecovery(friends, threshold, delayPeriod)`);     
  console.log(`Submitted values : .createRecovery(${JSON.stringify(friends, null, 2)}, ${THRESHOLD}, ${DELAY_PERIOD})`);     
  console.log(`createRecovery tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => { console.error(err) }).finally(() => process.exit());