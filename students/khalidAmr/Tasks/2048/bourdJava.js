let cells = document.querySelectorAll(".cell");

let scoreElement = document.getElementById("score");
let bestElement = document.getElementById("best");
let movesElement = document.getElementById("moves");

let newGameButton = document.getElementById("newGame");
let undoButton = document.getElementById("undo");

let overlay = document.getElementById("overlay");
let overlayTitle = document.getElementById("overlayTitle");
let overlayText = document.getElementById("overlayText");
let finalScoreElement = document.getElementById("finalScore");
let finalMovesElement = document.getElementById("finalMoves");
let overlayRestartButton = document.getElementById("overlayRestart");
let overlayUndoButton = document.getElementById("overlayUndo");


let board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

let score = 0;
let moves = 0;
let best = Number(localStorage.getItem("shift2048_best")) || 0;
let bestTile = Number(localStorage.getItem("shift2048_bestTile")) || 0;
let gamesPlayed = Number(localStorage.getItem("shift2048_gamesPlayed")) || 0;
let winStreak = Number(localStorage.getItem("shift2048_winStreak")) || 0;
let bestWinStreak = Number(localStorage.getItem("shift2048_bestWinStreak")) || 0;

let gameActive = true;   
let hasWon = false;      
let sessionFinalized = false;

let history = [];              
let lastDrawnBoard = null;     

const currentMode = new URLSearchParams(window.location.search).get("mode") || "classic";

function getHighestTile(sourceBoard) {
    let max = 0;
    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 4; column++) {
            if (sourceBoard[row][column] > max) {
                max = sourceBoard[row][column];
            }
        }
    }
    return max;
}

function saveRunToLeaderboard(entry) {
    let runs = [];
    try {
        runs = JSON.parse(localStorage.getItem("shift2048_history")) || [];
    } catch (e) {
        runs = [];
    }
    runs.unshift(entry);
    if (runs.length > 50) {
        runs = runs.slice(0, 50);
    }
    localStorage.setItem("shift2048_history", JSON.stringify(runs));
}

function finalizeSession() {

    if (moves === 0 || sessionFinalized) {
        return;
    }

    let tile = getHighestTile(board);

    if (tile > bestTile) {
        bestTile = tile;
        localStorage.setItem("shift2048_bestTile", bestTile);
    }

    gamesPlayed++;
    localStorage.setItem("shift2048_gamesPlayed", gamesPlayed);

    winStreak = hasWon ? winStreak + 1 : 0;
    localStorage.setItem("shift2048_winStreak", winStreak);

    if (winStreak > bestWinStreak) {
        bestWinStreak = winStreak;
        localStorage.setItem("shift2048_bestWinStreak", bestWinStreak);
    }

    saveRunToLeaderboard({
        score: score,
        moves: moves,
        tile: tile,
        won: hasWon,
        mode: currentMode,
        date: Date.now()
    });

    sessionFinalized = true;
}


function drawBoard() {

    let cellNumber = 0;

    for (let row = 0; row < 4; row++) {

        for (let column = 0; column < 4; column++) {

            let value = board[row][column];
            let cell = cells[cellNumber];

            if (value === 0) {
                cell.textContent = "";
                cell.removeAttribute("data-value");
            } else {
                cell.textContent = value;
                cell.dataset.value = value;
            }

            cell.classList.toggle("tile-super", value > 2048);

            let changed = lastDrawnBoard && lastDrawnBoard[row][column] !== value;
            if (changed && value !== 0) {
                cell.classList.remove("new-tile");
                void cell.offsetWidth; 
                cell.classList.add("new-tile");
            }

            cellNumber++;
        }
    }

    lastDrawnBoard = cloneBoard(board);

    if (score > best) {
        best = score;
        localStorage.setItem("shift2048_best", best);
    }

    scoreElement.textContent = score;
    bestElement.textContent = best;
    movesElement.textContent = moves;

    updateUndoButtons();
}


function cloneBoard(source) {
    return source.map(function (row) {
        return row.slice();
    });
}

function boardsAreEqual(a, b) {
    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 4; column++) {
            if (a[row][column] !== b[row][column]) {
                return false;
            }
        }
    }
    return true;
}

function updateUndoButtons() {
    let disabled = history.length === 0;
    undoButton.disabled = disabled;
    overlayUndoButton.disabled = disabled;
}

function addRandomTile() {

    let emptyCells = [];

    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 4; column++) {
            if (board[row][column] === 0) {
                emptyCells.push({ row: row, column: column });
            }
        }
    }

    if (emptyCells.length === 0) {
        return;
    }

    let randomIndex = Math.floor(Math.random() * emptyCells.length);
    let randomCell = emptyCells[randomIndex];

    board[randomCell.row][randomCell.column] = Math.random() < 0.9 ? 2 : 4;
}

function slideRowLeft(row) {

    let tiles = row.filter(function (value) {
        return value !== 0;
    });

    let merged = [];
    let scoreGained = 0;

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === tiles[i + 1]) {
            let newValue = tiles[i] * 2;
            merged.push(newValue);
            scoreGained += newValue;
            i++; 
        } else {
            merged.push(tiles[i]);
        }
    }

    while (merged.length < 4) {
        merged.push(0);
    }

    return { row: merged, scoreGained: scoreGained };
}

function transpose(matrix) {
    let result = [];
    for (let column = 0; column < 4; column++) {
        let newRow = [];
        for (let row = 0; row < 4; row++) {
            newRow.push(matrix[row][column]);
        }
        result.push(newRow);
    }
    return result;
}

function moveLeft() {
    let scoreGained = 0;
    for (let row = 0; row < 4; row++) {
        let result = slideRowLeft(board[row]);
        board[row] = result.row;
        scoreGained += result.scoreGained;
    }
    return scoreGained;
}

function moveRight() {
    let scoreGained = 0;
    for (let row = 0; row < 4; row++) {
        let reversed = board[row].slice().reverse();
        let result = slideRowLeft(reversed);
        board[row] = result.row.reverse();
        scoreGained += result.scoreGained;
    }
    return scoreGained;
}

function moveUp() {
    board = transpose(board);
    let scoreGained = moveLeft();
    board = transpose(board);
    return scoreGained;
}

function moveDown() {
    board = transpose(board);
    let scoreGained = moveRight();
    board = transpose(board);
    return scoreGained;
}



function handleMove(direction) {

    if (!gameActive) {
        return;
    }

    let boardBeforeMove = cloneBoard(board);
    let scoreGained = 0;

    if (direction === "left") scoreGained = moveLeft();
    if (direction === "right") scoreGained = moveRight();
    if (direction === "up") scoreGained = moveUp();
    if (direction === "down") scoreGained = moveDown();

    let moved = !boardsAreEqual(boardBeforeMove, board);

    if (!moved) {
        return;
    }

    ShiftSound.play("move");

    history.push({ board: boardBeforeMove, score: score, moves: moves });

    score += scoreGained;

    if (scoreGained > 0) {
        ShiftSound.play("merge");
    }   

    moves++;

    addRandomTile();
    drawBoard();

    checkWin();
    checkGameOver();
}


function checkWin() {

    if (hasWon) {
        return;
    }

    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 4; column++) {
            if (board[row][column] === 2048) {
                hasWon = true;
                showOverlay("win");
                return;
            }
        }
    }
}

function checkGameOver() {

    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 4; column++) {
            if (board[row][column] === 0) {
                return;
            }
        }
    }

    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 4; column++) {
            let value = board[row][column];
            if (column < 3 && board[row][column + 1] === value) return;
            if (row < 3 && board[row + 1][column] === value) return;
        }
    }

    gameActive = false;
    finalizeSession();
    showOverlay("lose");
}

function showOverlay(type) {

    if (type === "win") {
        overlayTitle.textContent = "YOU WIN!";
        overlayText.textContent = "You reached the 2048 tile!";
        overlayRestartButton.textContent = "KEEP GOING";
    } else {
        overlayTitle.textContent = "GAME OVER";
        overlayText.textContent = "No more moves left.";
        overlayRestartButton.textContent = "PLAY AGAIN";
    }

    finalScoreElement.textContent = score;
    finalMovesElement.textContent = moves;

    overlay.classList.add("show");
}

function hideOverlay() {
    overlay.classList.remove("show");
}


function newGame() {

    finalizeSession();
    sessionFinalized = false;

    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    score = 0;
    moves = 0;
    history = [];
    hasWon = false;
    gameActive = true;
    lastDrawnBoard = null;

    hideOverlay();

    addRandomTile();
    addRandomTile();

    drawBoard();
}

function undo() {

    if (history.length === 0) {
        return;
    }

    let previousState = history.pop();

    board = previousState.board;
    score = previousState.score;
    moves = previousState.moves;

    gameActive = true;   
    lastDrawnBoard = null; 
    sessionFinalized = false;

    hideOverlay();
    drawBoard();
}



document.addEventListener("keydown", function (event) {

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleMove("left");
    } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleMove("right");
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        handleMove("up");
    } else if (event.key === "ArrowDown") {
        event.preventDefault();
        handleMove("down");
    }
});


const classicBoard = document.getElementById("board");

let touchStart = null;

classicBoard.addEventListener("pointerdown", function (event) {
    if (!gameActive) return;

    touchStart = {
        x: event.clientX,
        y: event.clientY
    };
});

window.addEventListener("pointerup", function (event) {
    if (!touchStart || !gameActive) return;

    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;

    touchStart = null;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(dx > 0 ? "right" : "left");
    }

    else {
        handleMove(dy > 0 ? "down" : "up");
    }
});



window.addEventListener("pointerup", function (event) {
    if (!touchActive) return;
    touchActive = false;

    let dx = event.clientX - touchStartX;
    let dy = event.clientY - touchStartY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(dx > 0 ? "right" : "left");
    } else {
        handleMove(dy > 0 ? "down" : "up");
    }
});

newGameButton.addEventListener("click", newGame);
undoButton.addEventListener("click", undo);
overlayUndoButton.addEventListener("click", undo);

overlayRestartButton.addEventListener("click", function () {
    if (gameActive) {
        hideOverlay();
    } else {
        newGame();
    }
});

window.addEventListener("pagehide", finalizeSession);

newGame();