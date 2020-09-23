pragma solidity 0.5.12;

import "./Ownable.sol";
//import "@openzeppelin/contracts/math/SafeMath.sol";
import "./provableAPI.sol";


contract CoinFlipV2 is Ownable, usingProvable {
 //   using SafeMath for uint;

    //Variables
    uint constant NUM_RANDOM_BYTES_REQUESTED = 1;
    uint public latestNumber;
    uint public houseBalance;

    //Modifiers
    modifier costs(uint value) {
        require(msg.value >= value);
        _;
    }

    //structs
    struct Bet {
        address payable user;
        uint betAmount;
        uint headsOrTails;
    }

    struct Result {
        uint reward;
        bool win;
    }

    //Mappings
    mapping(bytes32 => Bet) public waiting;
    mapping(address => Result) public results;
    mapping(address => uint) public balances;
    mapping(address => bool) public waitingStatus;

    //Events
    event FlipCoinResult (address user, bool status, uint reward);
    event LogNewProvableQuery (string description);
    event GeneratedRandomNumber (uint randomNumber);
    event WaitingStatus (bool status);
    event LogQueryID (bytes32 queryId);
    event OwnerWithdrawl (address owner, uint amount, uint houseBalance);
    event UserWithdrawl (address indexed user, uint amount);
    
    //Constructor
    constructor() public payable {
        houseBalance = 2 ether;
    }

    //Functions
    function flipCoin(uint _headsOrTails) public payable costs(0.01 ether) {
        require(waitingStatus[msg.sender] == false, "you are already playing");
        require((msg.value * 2) <= (address(this).balance), "The bet amount cannot exceed the payable jackpot!");
        require(_headsOrTails == 0 || _headsOrTails == 1, "Must can only enter 0 or 1");

        //starting oracle call
        uint QUERY_EXECUTION_DELAY = 0;
        uint GAS_FOR_CALLBACK = 200000;

        //below can be un-commented along with testRandom function for testing off-chain
        //bytes32 queryId = testRandom();

        bytes32 queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
            );
        

        emit LogNewProvableQuery("Provable query was sent, awaiting reply");
        // set player waiting to true
        waitingStatus[msg.sender] = true;

        //set user and bet amounts in mappings
        setBet(queryId, msg.sender, msg.value, _headsOrTails);

        //log qery id event emitted
        emit LogQueryID(queryId);
    }

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        //temporarily commented out require while not on testnet
        //require(msg.sender == provable_cbAddress());
        latestNumber = uint(keccak256(abi.encodePacked(_result))) % 2;
        
        //emit event with latest random number generated
        emit GeneratedRandomNumber(latestNumber);

        //to do
        // if random number is equal to user heads or tails then double reward and add t user balance. remove that amount fromm housebalance
        // else add betamount to housebalance
        // emit generated random number
        // emit flip coin result

        if (waiting[_queryId].headsOrTails == latestNumber) {
            //create new result to log users win
            Result memory newResult;
            newResult.win = true;
            newResult.reward = waiting[_queryId].betAmount * 2;
            results[waiting[_queryId].user] = newResult;

            //add reward to user balance
            balances[waiting[_queryId].user] += newResult.reward;

            //set waiting status to false since flip has ended
            waitingStatus[waiting[_queryId].user] = false;

            //emit flip result event
            emit FlipCoinResult(waiting[_queryId].user, newResult.win , newResult.reward);  
            
            //reset waiting mapping
            delete waiting[_queryId];
        }
        
        else { 
            //create new result to log the users losing flip
            Result memory newResult;
            newResult.win = false;
            newResult.reward = 0;
            results[waiting[_queryId].user] = newResult;

            //add bet amount to house balance
            houseBalance += waiting[_queryId].betAmount;
           
            //set waiting status to false since flip has ended
            waitingStatus[waiting[_queryId].user] = false;
           
            //emit events
            emit FlipCoinResult(waiting[_queryId].user, newResult.win , newResult.reward);
               
            //reset waiting mapping
            delete waiting[_queryId];
        }
    }

    //function only for testing to avoid testnet delays
    /*function testRandom() public returns(bytes32) {
        bytes32 queryId = bytes32(keccak256(abi.encodePacked(msg.sender)));
        __callback(queryId, "1", bytes("test"));
        return queryId;
    }
    */

    function setBet(bytes32 _queryId, address payable _user, uint _betAmount, uint _headsOrTails) internal {
        Bet memory newBet;
        newBet.user = _user;
        newBet.betAmount = _betAmount;
        newBet.headsOrTails = _headsOrTails;
        waiting[_queryId] = newBet;
    }

    function userWithdraw(address payable _to, uint _amount) public {
        require(balances[msg.sender] >= _amount, "Not enough funds to withdraw");
        balances[msg.sender] -= _amount;
        _to.transfer(_amount);
        emit UserWithdrawl(_to, _amount);
    }

    function ownerWithdraw(uint _amount) public onlyOwner {
        require(_amount <= houseBalance, "Something is wrong, houseBalance and contract balance dont match");
        uint toTransfer = _amount;
        houseBalance = houseBalance - toTransfer;
        msg.sender.transfer(toTransfer);
        emit OwnerWithdrawl(msg.sender, toTransfer, houseBalance);
    }

    function getHouseBalance() public view returns(uint) {
        return houseBalance;
    }

    function getUserBalance(address _user) public view returns(uint) {
        return balances[_user];
    }
}