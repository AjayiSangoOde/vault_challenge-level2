'reach 0.1';

//countdownTimer is sent to ensure the code execute after it is reached
const countdownTimer=7;
const sharedClock= {
  showTimer: Fun([UInt], Null)
}
export const main = Reach.App(() => {
  const A = Participant('Alice', {
    //this defines how much we locked
     ...sharedClock,
     lockedMoney: Fun([], UInt) ,
     //We want Alice to give the choice of trannsferring the fund or not
     getChoice: Fun([], Bool),
     informTimeout: Fun([], Null), //created a function msg for Alice to timeout if no response
     deadline: UInt // The is the timeout according to the block in the consensus network
  });
  const B = Participant('Bob', {
    ...sharedClock,
    //creating function that accept terms or not for Bob...returning Bool to the backend
    acceptTerms: Fun([UInt], Bool)
  });
  init();
  const informTimeout = () => {
    A.only(() => {
      interact.informTimeout();
    }) 
  };
    
  //This pay the contract by Alice...the said amount(6000) to be locked
  A.only(()=>{
    const safe= declassify(interact.lockedMoney()); 
    const deadline= declassify(interact.deadline);//we called the parsed in token const SAFE
    
  })
  A.publish(safe, deadline)//we publish the safe on the consensus network
   .pay(safe) //we paid the safe to the vault contract
 
  commit();
  B.only(()=>{
    const Terms= declassify(interact.acceptTerms(safe));

  })
  // The second one to publish always attaches
  B.publish(Terms);
  commit();

  A.only(()=>{
    const choice= declassify(interact.getChoice());
    
    
  })
  A.publish(choice)
  .timeout(relativeTime(deadline), () => closeTo(A, informTimeout));
  if (choice){
    transfer(balance()).to(A);
  } else{
    transfer(balance()).to(B);
  }
  commit();
  each([A,B], ()=>{
     interact.showTimer(countdownTimer);
  });
  
  // write your program here
  exit();
  });
