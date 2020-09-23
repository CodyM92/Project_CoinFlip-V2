var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0x256c05a94533BA6306f819F2d8f7608934D59862", {from: accounts[0] });
      console.log(contractInstance);
    });

    $("#place_bet_button").click(flipCoin)
    $("#userWithdraw_button").click(userWithdraw)
    $('#ownerWtihdraw_button').click(ownerWithdraw)
    $('#getHouseBalance_button').click(checkHouseBalance)
    $('#getUserBalance_button').click(getUserBalance)
});

/*
  //emits logqueryid and random number results to ensure oracle call successful
  contractInstance.events.LogQueryId({ }, 
    function(error, event) {
      console.log(event);
      console.log(event.queryId);
  }) 
      

  contractInstance.events.GeneratedRandomNumber({ }, 
    function(error, event) {
      console.log(event);
      console.log(event.latestNumber);
  }) 
*/

function flipCoin() {
    var bet_amount = $("#bet_amount").val();
    var _headsOrTails = $("#headsOrTails_choice").val();
    if(!isNaN(bet_amount)) {
      if(bet_amount > web3.eth.balance) alert("You can't bet more than 50% of the House Balance");
      else if(bet_amount < 0.005) alert("You must bet at least 0.005 Ether");
      else {
        console.log(bet_amount);
        config = {value: web3.utils.toWei(bet_amount)};
        contractInstance.methods.flipCoin(_headsOrTails).send(config)
      };
    };
    contractInstance.events.GeneratedRandomNumber({ }, 
      function(error, event) {
        console.log(event);
        console.log(event.latestNumber);
    })
  }; 
    /*
    //waits for flipcoin result to be emitted - then displays result onscreen through #output
    contractInstance.once('FlipCoinResult', {

    }, 
      function(error, event) { 
        //returns flipcoinresult event with .reward .status and .user can be called
        console.log(event);
        let _reward = event.reward;
        let _user = event.user;
        let _status = event.status; 
        if (_status == true) {
        $("#Output").text(_user + " has won " + _reward);
        }
        else if (_status == false) {
          $("#Output").text(_user + " has lost, try again next time! ");
        }
      })
    };


    */

  function checkHouseBalance() {
    contractInstance.methods.getHouseBalance().call().then(function (result) {
      console.log(result);
      let _result = result.houseBalance;
      console.log(_result);
      console.log(_result).toString();
    })
  };
  
  function getUserBalance() {
    let _user = web3.eth.accounts[0];
    contractInstance.methods.getUserBalance(_user).call().then(function (result) {
      console.log(result);
      let _result = result.userBalance;
      console.log(_result);
      console.log(_result).toString();
    });
  };


  function userWithdraw() {
    let _amount = $("#userWithdraw_amount").val();
    contractInstance.methods.userWithdraw(_amount).send()
    .on("receipt", function(receipt) {
      console.log(receipt)
    });
  };

  function ownerWithdraw() {
    let _amount = $("#ownerWithdraw_amount").val();
    contractInstance.methods.ownerWithdraw(_amount).send()
    .on("receipt", function(receipt) {
      console.log(receipt)
    });
  };
