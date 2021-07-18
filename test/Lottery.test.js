const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // Capital Web3 is the constructor function
const web3 = new Web3(ganache.provider()); // instance of web3

const { interface, bytecode } = require('../compile'); 
// curly braces because we are requiring an object that has the interface and bytecode properties

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deployed a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
        //^^^^ in parentheses value that it should be first, then value that it is
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(accounts[1], players[1]);
        assert.strictEqual(accounts[2], players[2]);
        assert.strictEqual(3, players.length);
        //^^^^ in parentheses value that it should be first, then value that it is
    });

    it('requires a minimum amount of ether to enter', async() => {
        try{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: 0
        });
        assert(false);
    } catch (err) {
        assert(err);
        // ok^ checks to see and assert that some value is passed into the function
    }
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1] // not the manager account called here
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    // test to go through the entire contract 
    it('sends money to winner & resets the player array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.9', 'ether'));
        // 1.8 ether is allowing for some amount of gas being spent for the transaction
        const lotteryBalance = await web3.eth.getBalance(lottery.options.address);
        assert(lotteryBalance == 0);
    });
});