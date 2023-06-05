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
  const DELAY_PERIOD = 0;
  const PROXY_TYPE = 'Staking';
  const AMOUNT_TO_SEND = 5200000000000; // 5.2000 WND
  const DEPOSIT_BASE = api.consts.proxy.proxyDepositBase.toString();     // 1,000,400,000,000 = 1.00040 WND
  const DEPOSIT_FACTOR = api.consts.proxy.proxyDepositFactor.toString(); //     1,650,000,000 = 0.00165 WND
  const CHECKSUM = parseInt(DEPOSIT_BASE) + parseInt(DEPOSIT_FACTOR);    // 1,002,050,000,000 = 1.00200 WND

  // 3. Initialize accounts
  const Alice = keyring.addFromUri(process.env.ALICE_MNEMONIC);
  const AliceProxy = keyring.addFromUri(process.env.PROXY_MNEMONIC);

    // 4. Send 1 WND to new staking proxy
    const txTransferHash = await api.tx.balances
    .transfer(AliceProxy.address, AMOUNT_TO_SEND)
    .signAndSend(Alice, {tip: 10000000000});
  console.log(`Required values  : .transfer(destination, amount)`);     
  console.log(`Submitted values : .transfer(${AliceProxy.address}, ${formatBalance(AMOUNT_TO_SEND)})`); // 1.0000 WND
  console.log(`transfer() tx: https://westend.subscan.io/extrinsic/${txTransferHash}`); 

  // 5. Create a new staking proxy
  const txAddHash = await api.tx.proxy
    .addProxy(AliceProxy.address, PROXY_TYPE, DELAY_PERIOD)
    .signAndSend(Alice, {tip: 10000000000});
  console.log(`\nproxyDepositBase \+ ( proxyDepositFactor * number of proxies )\n : ${formatBalance(DEPOSIT_BASE)} \+ ${formatBalance(DEPOSIT_FACTOR)} \= ${formatBalance(parseInt(DEPOSIT_BASE)+parseInt(DEPOSIT_FACTOR))}\n`);
  console.log(`Required values  : .addProxy(address, type, delay)`);     
  console.log(`Submitted values : .addProxy(${AliceProxy.address}, ${PROXY_TYPE}, ${DELAY_PERIOD})`);
  console.log(`addProxy() tx: https://westend.subscan.io/extrinsic/${txAddHash}\n`);  
}

main().catch((err) => { console.error(err) }).finally(() => process.exit());