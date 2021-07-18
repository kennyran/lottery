const path = require('path');
const fs = require('fs');
const solc = require('solc');

// generating a path that points directly to the files in the argument
const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol'); // passing in the directory name, contracts folder, and Lottery.sol file as arguments
// fs is the file system module, specifying utf8 encoding and pointing to lotteryPath const 
const source = fs.readFileSync(lotteryPath, 'utf8');

// solidity compiler, from this file we are returning the definition of our contract 'Lottery'
module.exports = solc.compile(source, 1).contracts[':Lottery'];
