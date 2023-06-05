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