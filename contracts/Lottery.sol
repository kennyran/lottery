pragma solidity ^0.4.17; // specifys solidity version and lets the compiler know to behave based on that version

//Define the contract
contract Lottery {
    address public manager; // manager is public so we can easily access it when I make my front end application
    address[] public players;

    // ======== functions ========
    function Lottery() public {
        manager = msg.sender;
    }

    // payable is a variable needed when some ether might be sent along when the function is invoked
    function enter() public payable {
        require(msg.value > .01 ether);

        players.push(msg.sender);
    }

    function random() private view returns (uint256) {
        //sha3 is a global variable, as well as keccak256 too.
        //hashing algorithm
        return uint256(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public restricted {
        uint256 index = random() % players.length;
        players[index].transfer(this.balance); // access players address in the array using this line.
        //.transfer() attempts to take some amount of money from current contract and send it to the players[index]
        // lastWinner = players.index;
        players = new address[](0); // new dynamic array [] and (0) create a new set of addresses
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    // public because we want everyone to be able to see the function
    // view because it will not attempt to change data in contract
    // returns a dynamic array of addresses
    function getPlayers() public view returns (address[]) {
        return players;
    }
}
