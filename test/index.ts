import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, network } from 'hardhat';
import { RockPaperScissors } from '../typechain';

import Web3 from 'web3';
import { assert } from 'chai';
// @ts-ignore
const web3 = new Web3(network.provider) as Web3;

let rps: RockPaperScissors;

let owner: SignerWithAddress
let user0: SignerWithAddress
let user1: SignerWithAddress

async function reDeploy() {
    [owner, user0, user1] = await ethers.getSigners();
    let RockPaperScissors = await ethers.getContractFactory('RockPaperScissors');
    rps = await RockPaperScissors.deploy() as RockPaperScissors;
}

describe('Contract: RockPaperScissors', () => {
    describe('createGame', () => {
        it('should let us create a game', async () => {
            await reDeploy();
            const bet = 1000;
            const tx = await rps.createGame(user0.address, { value: bet })
            let events = (await tx.wait()).events;
            let gameCreatedEvent = events!.map((item) => item.args)[0] as any
            assert.equal(gameCreatedEvent.creator, owner.address, `GameCreated Event should include the creators address ${owner.address}`);
            assert(gameCreatedEvent.gameNumber, `GameCreated Event should include a game number for us to refer to`);
            assert.equal(gameCreatedEvent.bet, bet, `GameCreated Event should include the bet size`);
        })
        it('should fail to create a game when no bet is placede', async () => {})
    })
    describe('joinGame', function() {
        it('should let us join a game for a valid participant', async () => {
            await reDeploy();
            const bet = 1000;
            const createGame = await rps.createGame(user0.address, { value: bet })
            let createGameEvents = (await createGame.wait()).events;
            let createGameEvent = createGameEvents!.map((item) => item.args)[0] as any
            let joinGame = await rps.connect(user0).joinGame(createGameEvent.gameNumber, { value: bet });
            let joinGameEvents = (await joinGame.wait()).events;
            let joinGameEvent = joinGameEvents!.map((item) => item.args)[0] as any
            const players = joinGameEvent.players;
            assert.isAbove(players.indexOf(owner.address), -1, `Could not find ${owner.address} in players array on the Game Started Event`);
            assert.isAbove(players.indexOf(user0.address), -1, `Could not find ${user0.address} in players array on the Game Started Event`);
        });
        it('should let us join a game twice as a valid participant', async () => {})
        it('should not let us join a game that has not been created', async () => {})
        it('should not let us join a game without sending sufficient funds', async () => {})
        it('should refund additional funds sent', async () => {})

    });
    describe('makeMove', function() {
        it('should detect a winner', async function() {
            await reDeploy();
            const bet = 1000;
            const createGame = await rps.createGame(user0.address, { value: bet })
            let createGameEvents = (await createGame.wait()).events;
            let createGameEvent = createGameEvents!.map((item) => item.args)[0] as any
            const { gameNumber } = createGameEvent
            await rps.connect(user0).joinGame(createGameEvent.gameNumber, { value: bet });
            await rps.makeMove(gameNumber, 1); // rock
            let makeMove = await rps.connect(user0).makeMove(gameNumber, 2); // paper
            let makeMoveEvents = (await makeMove.wait()).events;
            let makeMoveEvent = makeMoveEvents!.map((item) => item.args)[0] as any
            const { winner } = makeMoveEvent
            assert.equal(winner, user0.address, `Expected the winner to be ${user0.address} (paper covers rock)`)
        })
        it('should not allow invalid moves', async () => {})
        it('should not allow moves on a non-started game', async () => {})
        it('should not allow moves on a completed game', async () => {})
        it('should detect winners at random', async () => {})
    })
})
