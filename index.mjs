import {loadStdlib , ask} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);


const startingBalance = await stdlib.parseCurrency(100);

//Initializing Bob account with 100 Algos in this case
const  accBob =await stdlib.newTestAccount( startingBalance);
console.log('Hola, Alice and Bob!');

//Initializing Alice account with 10,000 algos in this case
const accAlice= await stdlib.newTestAccount(  stdlib.parseCurrency(10000))
const fmt=(x)=> stdlib.formatCurrency(x,4)
const getBalance= async (who)=>fmt(await stdlib.balanceOf(who))
const beforeAlice= await getBalance(accAlice)
const beforeBob= await getBalance(accBob)

console.log(`This is the current balance of ${beforeAlice}`)
console.log(`This is the current balance of ${beforeBob}`)

console.log('Launching the treasury lock...');
const ctcAlice = await accAlice.contract(backend);
const ctcBob = await accBob.contract(backend, ctcAlice.getInfo());


//We showing the sharedClock which is an object from the backend
const sharedClock=()=> ({
  showTimer: (amt)=>{
  console.log("This is the countdownTimer:")
   console.log(parseInt(amt))
  }
})


console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    deadline: 5,
    ...stdlib.hasRandom,
    ...sharedClock(),
    lockedMoney: async ()=>{
      const amt= await ask.ask(
       "Alice , how much do you wanna safe in the lock as Alice?",
          stdlib.parseCurrency);
        return (amt)

    } ,//We parsed in 6000 algos to be saved in the vault contract
    // implement Alice's interact object here
    getChoice:async ()=>{
       const choice= ask.ask(
        "Alice, are you still here?",
        ask.yesno
       )
       if ( Math.random() <= 0.6 ) {
        for ( let i = 0; i < 10; i++ ) {
          console.log(`  Alice takes their sweet time sending it back...`);
          await stdlib.wait(1);
        }}
      if(choice){
      return choice
    }
      else{
        return choice
      }
   
  },
  informTimeout: ()=>{
    console.log("Timing out...")
    console.log("Timed out! Do not disturb the vault if you ain't ready please!!!")
  }}),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    ...sharedClock(),
    //acceptTerms takes in UInt and return Bool to the backend
    acceptTerms: async (amt)=>{
      const term = await ask.ask(
        "Bob , do you accept Alice's terms?",
        ask.yesno
      ); if (term){
      console.log(`Bob accepted the term for the transfer of ${stdlib.formatCurrency(amt)}`)
      return term
    } else{
      process.exit(0)
    }

    }
    // implement Bob's interact object here
  }),
]);
const afterAlice= await getBalance(accAlice)
const  afterBob= await getBalance(accBob)

console.log(`This is the current balance of ${afterAlice}`)
console.log(`This is the current balance of ${afterBob}`)
console.log('Goodbye, Alice and Bob!');

ask.done();
