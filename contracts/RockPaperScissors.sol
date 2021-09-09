pragma solidity 0.8.4;

contract RockPaperScissors {
    
    enum GameStatus {
        EMPTY,
        WAIT,
        STARTED,
        PLAYER_ONE_WIN,
        PLAYER_TWO_WIN,
        TIE
    }
    
    enum Moves {
        EMPTY,
        ROCK,
        PAPER,
        SCISSORS
    }
    
    struct Game {
        address payable player1;
        address payable player2;
        uint256 bet;
        GameStatus status;
        Moves player1Move;
        Moves player2Move;
    }
    
    uint256 public gamesCount;
    mapping(uint256 => Game) public gameById;
    
    event GameCreated(address creator, uint gameNumber, uint bet);
    event GameStarted(address payable[2] players, uint gameNumber);
    event GameComplete(address winner, uint gameNumber);
    
    function createGame(address payable participant) public payable {
        require(msg.value > 0, 'value is zero');
        gameById[gamesCount] = Game({
        player1: payable(msg.sender),
        player2: participant,
        bet: msg.value,
        status: GameStatus.WAIT,
        player1Move: Moves.EMPTY,
        player2Move: Moves.EMPTY
        });
        emit GameCreated(msg.sender, gamesCount, msg.value);
        gamesCount++;
    }
    
    function joinGame(uint gameNumber) public payable {
        Game storage game = gameById[gameNumber];
        require(msg.value >= game.bet, 'value is zero');
        require(game.status == GameStatus.WAIT, 'game already started or ended');
        require(game.player2 == msg.sender, 'invalid address joins the game');
        if (msg.value > game.bet) {
            payable(msg.sender).transfer(msg.value - game.bet);
        }
        game.status = GameStatus.STARTED;
        address payable[2] memory players = [ game.player1, game.player2 ];
        emit GameStarted(players, gameNumber);
    }
    
    function makeMove(uint gameNumber, uint moveNumber) public payable {
        require(moveNumber <= 3 && moveNumber != 0, 'invalid move');
        Game storage game = gameById[gameNumber];
        require(game.status == GameStatus.STARTED, 'game is ended');
        
        if (msg.sender == game.player1 && game.player1Move == Moves.EMPTY) {
            game.player1Move = Moves(moveNumber);
        } else if (msg.sender == game.player2 && game.player2Move == Moves.EMPTY) {
            game.player2Move = Moves(moveNumber);
        }
        
        if (game.player1Move == Moves.EMPTY ||
            game.player2Move == Moves.EMPTY) {
            return;
        }
        
        game.status = battle(game.player1Move, game.player2Move);
        
        address winner;
        
        if (game.status == GameStatus.TIE) {
            winner = address(0);
        }
        if (game.status == GameStatus.PLAYER_ONE_WIN) {
            winner = game.player1;
        } else if (game.status == GameStatus.PLAYER_TWO_WIN) {
            winner = game.player2;
        }
        
        if (winner == address(0)) {
            game.player1.transfer(game.bet);
            game.player2.transfer(game.bet);
        } else {
            payable(winner).transfer(game.bet * 2);
        }
        
        emit GameComplete(winner, gameNumber);
    }
    
    function battle(Moves move1, Moves move2) view public returns(GameStatus) {
        if (move1 == move2) {
            return GameStatus.TIE;
        }
        if (
            move1 == Moves.PAPER && move2 == Moves.ROCK ||
            move1 == Moves.ROCK && move2 == Moves.SCISSORS ||
            move1 == Moves.SCISSORS && move2 == Moves.PAPER
        ) {
            return GameStatus.PLAYER_ONE_WIN;
        } else {
            return GameStatus.PLAYER_TWO_WIN;
        }
    }
}
