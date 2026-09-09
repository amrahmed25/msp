
const SYMBOL_STYLING = {
    X: "text-pX text-7xl font-black leading-none w-[80px] h-[80px] flex items-center justify-center shrink-0 drop-shadow-[0_4px_0_#d64875] scale-110 pointer-events-none",
    O: "text-pO text-6xl font-black leading-none w-[80px] h-[80px] flex items-center justify-center shrink-0 drop-shadow-[0_4px_0_#2a9be3] pointer-events-none"
};

const cells = document.querySelectorAll('.cell');
const menuBtn = document.getElementById('menuBtn');
const menuModal = document.getElementById('menuModal');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const changeSetupBtn = document.getElementById('changeSetupBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const p1MiniSymbol = document.getElementById('p1MiniSymbol');
const p2MiniSymbol = document.getElementById('p2MiniSymbol');
const p1ScoreGrid = document.getElementById('p1ScoreGrid');
const p2ScoreGrid = document.getElementById('p2ScoreGrid');
const gameCard = document.getElementById('gameCard');
const setupModal = document.getElementById('setupModal');
const modeSingleBtn = document.getElementById('modeSingleBtn');
const modeMultiBtn = document.getElementById('modeMultiBtn');
const p1Input = document.getElementById('p1Input');
const p2Input = document.getElementById('p2Input');
const p2InputGroup = document.getElementById('p2InputGroup');
const startGameBtn = document.getElementById('startGameBtn');
const p1NameDisplay = document.getElementById('p1NameDisplay');
const p2NameDisplay = document.getElementById('p2NameDisplay');
const winnerBanner = document.getElementById('winnerBanner');
const winnerText = document.getElementById('winnerText');


let board = ["", "", "", "", "", "", "", "", ""];
let p1Symbol = "X"; 
let p2Symbol = "O";
let currentPlayer = "X";
let isBotMode = true;
let gameActive = false;
let p1Wins = 0;
let p2Wins = 0;
let currentRound = 0;
let p1RoundResults = [];
let p2RoundResults = [];
let p1Name = "Player 1";
let p2Name = "Bot";
let autoResetTimer = null;
let isDarkMode = true;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const now = audioCtx.currentTime;

        if (type === 'click') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'move') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(currentPlayer === 'X' ? 400 : 550, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'win') {
            const notes = [400, 500, 600, 800];
            notes.forEach((freq, idx) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, now + idx * 0.09);
                noteGain.gain.setValueAtTime(0.2, now + idx * 0.09);
                noteGain.gain.linearRampToValueAtTime(0.01, now + idx * 0.09 + 0.15);
                noteOsc.start(now + idx * 0.09);
                noteOsc.stop(now + idx * 0.09 + 0.15);
            });
        }
    } catch (e) {
        console.log("Audio exception", e);
    }
}

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];


function handleCellClick(e) {
    const targetCell = e.currentTarget;
    const index = targetCell.getAttribute('data-index');

    if (board[index] !== "" || !gameActive) return;
    if (isBotMode && currentPlayer !== p1Symbol) return;

    makeMove(index, currentPlayer);

    if (isBotMode && gameActive && currentPlayer === p2Symbol) {
        setTimeout(botMove, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    
    cell.innerHTML = `<span class="${SYMBOL_STYLING[player]}">${player}</span>`;
    playSound('move');

if (checkWin(player)) {
    gameActive = false;
    playSound('win');

    const winnerName = player === p1Symbol ? p1Name : p2Name;
    showWinnerBanner(`${winnerName} Wins! 🎉`);

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    currentRound++;

    if (player === p1Symbol) {
        p1Wins++;
        p1RoundResults[currentRound - 1] = "win";
        p2RoundResults[currentRound - 1] = "lose";
    } else {
        p2Wins++;
        p2RoundResults[currentRound - 1] = "win";
        p1RoundResults[currentRound - 1] = "lose";
    }

    updateScoreboard();

    if (currentRound === 3) {
        autoResetTimer = setTimeout(() => startNewMatch(), 2500);
    } 
    else {
        autoResetTimer = setTimeout(() => resetBoard(), 2500);
    }

    return;
}

if (board.every(c => c !== "")) {
    gameActive = false;

    showWinnerBanner("It's a Draw! 🤝");

    currentRound++;

    p1RoundResults[currentRound - 1] = "draw";
    p2RoundResults[currentRound - 1] = "draw";

    updateScoreboard();

    if (currentRound === 3) {
        autoResetTimer = setTimeout(() => startNewMatch(), 2200);
    } 
    else {
        autoResetTimer = setTimeout(() => resetBoard(), 2200);
    }

    return;
}

    currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function botMove() {

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {

            board[i] = p2Symbol;

            if (checkWin(p2Symbol)) {
                board[i] = "";
                makeMove(i, p2Symbol);
                return;
            }

            board[i] = "";
        }
    }

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {

            board[i] = p1Symbol;

            if (checkWin(p1Symbol)) {
                board[i] = "";
                makeMove(i, p2Symbol);
                return;
            }

            board[i] = "";
        }
    }

    const emptyCells = board
        .map((cell, index) => cell === "" ? index : null)
        .filter(index => index !== null);

    if (emptyCells.length > 0) {
        const randomIndex =
            emptyCells[Math.floor(Math.random() * emptyCells.length)];

        makeMove(randomIndex, p2Symbol);
    }
}

function checkWin(player) {
    return winPatterns.some(pattern => pattern.every(idx => board[idx] === player));
}

function showWinnerBanner(text) {
    winnerText.innerText = text;
    winnerBanner.classList.remove('hidden');
}

function hideWinnerBanner() {
    winnerBanner.classList.add('hidden');
}


function updateScoreboard() {
    p1NameDisplay.innerText = p1Name.toUpperCase();
    p2NameDisplay.innerText = p2Name.toUpperCase();

    const p1Dots = p1ScoreGrid.children;
    const p2Dots = p2ScoreGrid.children;

    for (let i = 0; i < 3; i++) {

        p1Dots[i].className =
            'score-dot h-3.5 rounded flex items-center justify-center text-[10px] font-bold';

        if (p1RoundResults[i] === "win") {
            p1Dots[i].innerText = "✓";
            p1Dots[i].classList.add("text-green-500");
        } 
        else if (p1RoundResults[i] === "lose") {
            p1Dots[i].innerText = "✗";
            p1Dots[i].classList.add("text-red-500");
        } 
        else if (p1RoundResults[i] === "draw") {
            p1Dots[i].innerText = "—";
            p1Dots[i].classList.add("text-yellow-300");
        } 
        else {
            p1Dots[i].innerText = "";
            p1Dots[i].classList.add("bg-[#284c5e]");
        }


        p2Dots[i].className =
            'score-dot h-3.5 rounded flex items-center justify-center text-[10px] font-bold';

        if (p2RoundResults[i] === "win") {
            p2Dots[i].innerText = "✓";
            p2Dots[i].classList.add("text-green-500");
        } 
        else if (p2RoundResults[i] === "lose") {
            p2Dots[i].innerText = "✗";
            p2Dots[i].classList.add("text-red-500");
        } 
        else if (p2RoundResults[i] === "draw") {
            p2Dots[i].innerText = "—";
            p2Dots[i].classList.add("text-yellow-300");
        } 
        else {
            p2Dots[i].innerText = "";
            p2Dots[i].classList.add("bg-[#284c5e]");
        }
    }
}

function resetBoard() {
    if (autoResetTimer) clearTimeout(autoResetTimer);
    hideWinnerBanner();
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";

    cells.forEach(c => c.innerHTML = "");

    if (isBotMode && currentPlayer === p2Symbol) {
        setTimeout(botMove, 400);
    }
}

function startNewMatch() {
    if (autoResetTimer) clearTimeout(autoResetTimer);

    currentRound = 0;
    p1Wins = 0;
    p2Wins = 0;

    p1RoundResults = [];
    p2RoundResults = [];

    updateScoreboard();

    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(c => c.innerHTML = "");

    gameActive = false;

    setupModal.classList.remove('hidden');

    hideWinnerBanner();
}

modeSingleBtn.addEventListener('click', () => {
    playSound('click');
    isBotMode = true;
    modeSingleBtn.className = "flex-1 py-2 rounded-lg font-bold text-sm bg-yellow-400 text-slate-900 transition-all";
    modeMultiBtn.className = "flex-1 py-2 rounded-lg font-bold text-sm text-white hover:bg-white/10 transition-all";
    p2InputGroup.classList.add('hidden');
});

modeMultiBtn.addEventListener('click', () => {
    playSound('click');
    isBotMode = false;
    modeMultiBtn.className = "flex-1 py-2 rounded-lg font-bold text-sm bg-yellow-400 text-slate-900 transition-all";
    modeSingleBtn.className = "flex-1 py-2 rounded-lg font-bold text-sm text-white hover:bg-white/10 transition-all";
    p2InputGroup.classList.remove('hidden');
});


startGameBtn.addEventListener('click', () => {
    
    const player1Name = p1Input.value.trim();

    if (player1Name === "") {
        alert("Please enter Player 1 name.");
        p1Input.focus();
        return;
    }

    if (!isBotMode && p2Input.value.trim() === "") {
        alert("Please enter Player 2 name.");
        p2Input.focus();
        return;
    }

    playSound('click');
    p1Name = p1Input.value.trim() || "Player 1";
    p2Name = isBotMode ? "Bot" : (p2Input.value.trim() || "Player 2");
    
    p1Wins = 0;
    p2Wins = 0;
    updateScoreboard();

    setupModal.classList.add('hidden');
    resetBoard();
});

themeToggleBtn.addEventListener('click', () => {
    playSound('click');
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.className = "font-fredoka select-none m-0 min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 transition-colors duration-300";
        gameCard.className = "relative w-full max-w-[420px] h-[680px] rounded-[20px] shadow-2xl flex flex-col justify-between p-5 border-4 bg-cardDark border-cardBorderDark transition-all duration-300";
        themeIcon.className = "fa-solid fa-moon";
    } else {
        document.documentElement.classList.remove('dark');
        document.body.className = "font-fredoka select-none m-0 min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200 transition-colors duration-300";
        gameCard.className = "relative w-full max-w-[420px] h-[680px] rounded-[20px] shadow-2xl flex flex-col justify-between p-5 border-4 bg-cardLight border-cardBorderLight transition-all duration-300";
        themeIcon.className = "fa-solid fa-sun";
    }
});

menuBtn.addEventListener('click', () => {
    playSound('click');
    menuModal.classList.toggle('hidden');
    menuModal.classList.toggle('flex');
});

changeSetupBtn.addEventListener('click', () => {
    playSound('click');
    menuModal.classList.add('hidden');
    setupModal.classList.remove('hidden');
});

resetScoreBtn.addEventListener('click', () => {
    playSound('click');
    p1Wins = 0; 
    p2Wins = 0;
    updateScoreboard();
    resetBoard();
    startNewMatch();
    menuModal.classList.add('hidden');
});

cells.forEach(c => c.addEventListener('click', handleCellClick));