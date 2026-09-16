import { player1, player2, level } from './data.js';
import AiBestMove from './AI.js';

export const STATUS = { xWin: -2, draw: -1, oWin: 2, inPlay: null, win: 2 };

class Game {
    static #board;
    static #currentPlayer;
    static #nextPlayer;
    static #gameEnded;

    static #initLogic() {
        this.#board =
            [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ];
        this.#currentPlayer = player1;
        this.#nextPlayer = player2;
        this.#gameEnded = false;
    }

    static makeAIMove() {
        // change board game here
        const index = AiBestMove(this.#board, level);
        const cell = UI.getCellByIndex(index);
        // change to real player to prevent INFINIT LOOP
        this.changePlayer();
        // ai play as player
        this.play(cell, index);
    }

    static play(cell, index) {
        const symbol = this.getCurrentPlayerSymbol();
         // set cell in board
        this.setCell(cell, index, symbol);

        // check game state
        const gameEndState = this.hasWinner(symbol) || this.isDraw();
        if (gameEndState) {
            this.showWinner(Math.abs(gameEndState) === STATUS.win);
            this.showDraw(gameEndState === STATUS.draw);
            return; // هنا لو الجيم خلص للاعب مش ال ai يوقف علشان ال ai ميلعبش بعد ما الجيم يخلص
        }

        // next player
        this.changePlayer();

        // check ai turn
        if (this.#currentPlayer.ai) {
            // update UI Current Player
            UI.updateCurrentPlayerContent(`AI turn`);
            setTimeout(() => {
                this.makeAIMove(this.#board);
            }, 500);
        } else
            UI.updateCurrentPlayerContent(`${this.#currentPlayer.name}`);
    }

    static getCurrentPlayerSymbol() {
        return this.#currentPlayer.symbol;
    }
    static getNextPlayer() {
        return this.#nextPlayer;
    }
    static isGameOver() {
        return this.#gameEnded;
    }
    static #getRow(index) {
        return Math.floor(index / 3);
    }
    static #getCol(index) {
        return index % 3;
    }

    static changePlayer() {
        [this.#currentPlayer, this.#nextPlayer] = [this.#nextPlayer, this.#currentPlayer];
        UI.toggleHoverColor(this.#currentPlayer.symbol);
    }

    static getCellValue(index) {
        return this.#board[this.#getRow(index)][this.#getCol(index)];
    }

    static setCell(cell, index, symbol) {
        this.#board[this.#getRow(index)][this.#getCol(index)] = symbol;
        UI.setCellContent(cell, symbol);
    }

    static hasWinner(symbol = 'O') {
        const state = symbol === 'X' ? STATUS.xWin : STATUS.oWin;
        // check every row and column
        for (let i = 0; i < 3; ++i) {
            const rowWin = this.#board[i].every(cell => cell === symbol);
            const colWin = [this.#board[0][i], this.#board[1][i], this.#board[2][i]].every(cell => cell === symbol);
            if (rowWin || colWin)
                return state;
        }
        // check diagonals
        const diagonalWin = [this.#board[0][0], this.#board[1][1], this.#board[2][2]].every(cell => cell === symbol);
        const antidiagonalWin = [this.#board[0][2], this.#board[1][1], this.#board[2][0]].every(cell => cell === symbol);
        if (diagonalWin || antidiagonalWin)
            return state;
        return STATUS.inPlay;
    }

    static isDraw() {
        for (let i = 0; i < 9; ++i)
            if (this.getCellValue(i) === '')
                return STATUS.inPlay;
        return STATUS.draw;
    }

    static isCellEmpty(index){
        return !(this.getCellValue(index))
    }

    static isAiTurn() {
        return this.#currentPlayer.ai;
    }

    static resetGame() {
        this.#initLogic();
        UI.initUI();
    }

    static showDraw(isDraw) {
        if(isDraw)
            this.#endGame("<h2 class=\"w-4/5 text-4xl text-center text-gray-300 text-shadow-gray-300 text-shadow-sm\">Draw!</h2>")
    }
    static showWinner(hasWin) {
        if(hasWin)
            this.#endGame(`<h2 class="w-full text-4xl text-center text-green-300 text-shadow-green-300 text-shadow-sm">${`${this.#currentPlayer.name} Win 🎉`}</h2>`);
    }

    static #endGame(message) {
        UI.endGame(message);
        this.#gameEnded = true;
    }
}

class UI {
    static #resultElement = document.querySelector('#score-reset h2');
    static #resetButton = document.querySelector('#score-reset button');
    static #currentPlayerElement = document.querySelector('#currentPlayer');
    static #cells = document.querySelectorAll('.cell');

    static setCellContent(cell, symbol) {
        cell.textContent = symbol;
        this.#toggleTextColor(cell, symbol);
        this.#toggleCellShadow(cell);
    }
    
    static #toggleTextColor(cell, symbol) {
        if (symbol === 'O') {
            cell.classList.remove('text-cyan-400');
            cell.classList.add('text-red-400');
            
            cell.classList.remove('hover:border-cyan-400');
            cell.classList.add('hover:border-red-400');
        }
    }
    static #toggleCellShadow(cell) {
        const cyanShadow = 'hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]';
        const redShadow  = 'hover:shadow-[0_0_10px_rgba(236,72,153,0.4)]';
        if (cell.textContent === 'O') {
            cell.classList.remove(cyanShadow);
            cell.classList.add(redShadow);
        } else if(cell.textContent === 'X') {
            cell.classList.remove(redShadow);
            cell.classList.add(cyanShadow);
        } else {
            cell.classList.remove(cyanShadow, redShadow);
        }
    }
    static toggleHoverColor(symbol) {
        const cyanBorder = 'hover:border-cyan-400';
        const redBorder  = 'hover:border-red-400';
        this.#cells.forEach(cell => {
            if (cell.textContent !== '') {
                cell.classList.remove(cyanBorder, redBorder);
            } else if (symbol === 'O') {
                cell.classList.remove(cyanBorder);
                cell.classList.add(redBorder);
            } else {
                cell.classList.remove(redBorder);
                cell.classList.add(cyanBorder);
            }
        })
    }

    static getCellByIndex(index) {
        return this.#cells[index];
    }

    static updateCurrentPlayerContent(message) {
        this.#currentPlayerElement.textContent = message;        
    }
    static updateResetButtonContent(message) {
        this.#resetButton.textContent = message;
    }
    static updateResultContent(message) {
        this.#resultElement.innerHTML = message;
    }

    static initUI() {
        this.#cells.forEach(cell => {
            cell.classList.add('hover:border-cyan-400');
            cell.classList.remove('hover:border-red-400');

            cell.classList.add('text-cyan-400');
            cell.classList.remove('text-red-400');
            this.setCellContent(cell, '');
        })
        this.updateResultContent('');
        this.updateCurrentPlayerContent(player1.name);
        this.updateResetButtonContent('Reset');
    }

    static endGame(message) {        
        this.updateCurrentPlayerContent('Game Ended');
        this.updateResultContent(message);
        this.updateResetButtonContent('New Game');
    }
}

export default Game;