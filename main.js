var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0x13b62a3bf6169fAfFDEd84701aD56D1Bff044b6E", {from: accounts[0] });
      console.log(contractInstance);
    });

    $("#place_bet_button").click(flipCoin)
    $("#userWithdraw_button").click(userWithdrawl)
    $('#ownerWithdraw_button').click(ownerWithdrawl)
    $('#getUserBalance_button').click(checkUserBalance)
});

function flipCoin() {
    var bet_amount = $("#bet_amount").val();
    var _headsOrTails = $("#headsOrTails_choice").val();
    if(!isNaN(bet_amount)) {
      if(bet_amount > (web3.eth.balance / 2)) alert("You can't bet more than 50% of the House Balance");
      else if(bet_amount < 0.004) alert("You must bet more than 0.004 Ether");
      else {
        console.log(bet_amount);
        config = {value: web3.utils.toWei(bet_amount)};
        contractInstance.methods.flipCoin(_headsOrTails).send(config)
      };
    };
    //waits for generated random number event
    contractInstance.events.GeneratedRandomNumber(
      function(error, result) {
        //prints a 0 or 1 to console showing generated random number
      console.log("I caught the GeneratedRandomNumber Event, and the result is " + result.returnValues.randomNumber);
    })

    //waits for flipcoin result to be emitted - then displays result onscreen through #output
    contractInstance.events.FlipCoinResult(
      function(error, result) { 
        let _reward = result.returnValues.reward;
        let _user = result.returnValues.user;
        let _status = result.returnValues.status; 
        if (_status == true) {
          $("#Output").text(_user + " has won " + (_reward / 1000000000000000000));
        }
        else if (_status == false) {
          $("#Output").text(_user + " has lost, try again next time! ");
        }
      }
    )};

  function checkUserBalance() {
    web3.eth.getAccounts((err, res) => {
      contractInstance.methods.balances(res[0]).call().then(function(result) {
      console.log(result);
      _result = result / 1000000000000000000; 
      $("#userBalanceOutput").html(_result + " ETH");
      })
    })
  };

  function userWithdrawl() {
    let _amount = $("#userWithdraw_amount").val();
    let __amount = web3.utils.toWei(_amount);
    web3.eth.getAccounts((err, res) => {
      contractInstance.methods.userWithdraw( res[0], __amount.toString() ).send().then((confirmationNr)=>{
        alert("Your Transaction has been confirmed!");
        checkUserBalance();
      })
    })
    contractInstance.events.UserWithdrawl(
      function(error, result) {
        //prints to console the address and amount user withdrew and to whom
        console.log("I caught the UserWithdrawl Event, and the amount sent is " + result.returnValues.amount);
    })
  };

  function ownerWithdrawl() {
    contractInstance.methods.ownerWithdraw().send().then((confirmationNr)=>{
      alert("Your Transaction has been confirmed!");
    })
    contractInstance.events.OwnerWithdrawl(
      function(error, result) {
        //prints to console the address and amount user withdrew and to whom
        console.log("I caught the OwnerWithdrawl Event, and the amount sent is " + result.returnValues.amount + " " + "and the owner is " + result.returnValues.to);
    })
  };
