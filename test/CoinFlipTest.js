
const CoinFlip = artifacts.require("CoinFlipV2");
const truffleAssert = require("truffle-assertions");

//define ether 
const ether = (n) => {
  return new web3.utils.BN(
      web3.utils.toWei(n.toString(), "ether")
  )
}

contract("CoinFlipV2", async function(accounts) {
  let instance;

  beforeEach(async function() {
    instance = await CoinFlip.deployed()
  })

  it("should initalize correctly - with 2 ether balance", async function() {
    let houseBalance = await instance.getHouseBalance();
    console.log(houseBalance.toString());
    assert(houseBalance.toString() === "2000000000000000000" ); //10 ether deposited initialization
  })
  it("Should allow onlyowner to withdraw funds from houseBalance", async function() {
    let amount = "1000000000000000000";
    await truffleAssert.fails(instance.ownerWithdraw(amount, { from: accounts[1] }));
  })
  it("Should emit owner withdrawl event", async function() {
    let result = await instance.ownerWithdraw("1000000000000000000",{ from: accounts[0] })
    const log = result.logs[0];
    assert(log.event.toString() === "OwnerWithdrawl", "Event name should be OwnerWithdrawl");
    const event = log.args;
    assert(event.owner.toString() === accounts[0].toString());
    assert(event.amount.toString() === "1000000000000000000");
    assert(event.houseBalance.toString() === "1000000000000000000");
  })
})
  
/*
  before(async function(){
    instance = await CoinFlip.deployed();
  })
    beforeEach(async function(){
      
    })
    it("Should check balance of contract = 10 ether", async function(){
      let result
      result = await instance.getHouseBalance()
      truffleAssert(result == web3.eth.getBalance(deployer))
    })
})
*/

