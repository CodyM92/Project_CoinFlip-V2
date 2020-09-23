const contract = artifacts.require("CoinFlipV2");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(contract, {value: web3.utils.toWei("2","ether"), gas: 6000000});
};
