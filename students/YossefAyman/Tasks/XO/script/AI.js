import { player1, player2 } from './data.js';
import Game, { STATUS } from './Game.js';
let ai      = player2;
let humen   = player1;

function checkWinner(board) {
    for (let i = 0; i < 3; i++) {
        if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
            return board[i][0] === 'X' ? STATUS.xWin : STATUS.oWin;
        }
        if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
            return board[0][i] === 'X' ? STATUS.xWin : STATUS.oWin;
        }
    }

    if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2] || 
        board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]
    ) {
        return board[1][1] === 'X' ? STATUS.xWin : STATUS.oWin;
    }

    const isFull = board.every(row => row.every(cell => cell !== ''));
    if (isFull)
        return STATUS.draw;

    return STATUS.inPlay;
}

function minimax(board, depth, isMax, level) {
    let res = checkWinner(board);    

    if (level !== null && depth >= level) {   
        console.log('null if not impossible, level: ', level);
        return 0;
    }


    if (res === STATUS.oWin) return 10 - depth;
    if (res === STATUS.xWin) return depth - 10;
    if (res === STATUS.draw) return 0;

    if (isMax) {
        let maxScore = -Infinity;
        for (let row = 0; row < 3; ++row) {
            for (let col = 0; col < 3; ++col) {
                if (board[row][col] !== '')
                    continue;

                board[row][col] = ai.symbol;
                let score = minimax(board, depth + 1, false, level);
                board[row][col] = '';

                maxScore = Math.max(score, maxScore);
            }
        }
        return maxScore;
    } else {
        // futuer hummen playes
        let minScore = Infinity;
        for (let row = 0; row < 3; ++row) {
            for (let col = 0; col < 3; ++col) {
                if (board[row][col] !== '')
                    continue;

                board[row][col] = humen.symbol;
                let score = minimax(board, depth + 1, true, level);
                board[row][col] = '';

                minScore = Math.min(score, minScore);
            }
        }
        return minScore;
    }
}

function AiBestMove(board, level) {
    let bestScore = -Infinity;
    let winMove;

    switch (level) {
        case 'easy':
            level = 2;
            break;
        case 'medium':
            level = 3;
            break;
        case 'impossible':
            level = null;
    }

    for (let row = 0; row < 3; ++row) {
        for (let col = 0; col < 3; ++col) {
            if (board[row][col] !== '')
                continue;

            board[row][col] = ai.symbol;
            let score = minimax(board, 0, false, level);
            board[row][col] = '';

            if (score > bestScore) {
                bestScore = score;
                winMove = { row, col };
            }
        }
    }

    board[winMove.row][winMove.col] = ai.symbol;
    Game.changePlayer();
    return 3 * winMove.row + winMove.col;
}

export default AiBestMove;