
const intro = document.getElementById("intro");
const game = document.getElementById("game");
const boltLayer = document.getElementById("boltLayer");
const introTitle = document.getElementById("introTitle");
const skipBtn = document.getElementById("skip");

const soundBtn = document.getElementById("soundBtn");
const timeSelect = document.getElementById("timeSelect");
const attackGame = document.getElementById("attackGame");
const timeOptions = [...document.querySelectorAll(".time-option")];
const startTime = document.getElementById("startTime");

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const moveCountEl = document.getElementById("moveCount");
const statusEl = document.getElementById("status");
const sideTimeEl = document.getElementById("sideTime");
const timeLeftEl = document.getElementById("timeLeft");
const timerBar = document.getElementById("timerBar");

const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const finalScoreEl = document.getElementById("finalScore");
const finalTileEl = document.getElementById("finalTile");
const finalMovesEl = document.getElementById("finalMoves");
const restartBtn = document.getElementById("restartBtn");
const overlayRestart = document.getElementById("overlayRestart");

const SIZE = 4;

let selectedTime = 60;
let board = [];
let score = 0;
let moves = 0;
let best = Number(localStorage.getItem("shiftTimeAttackBest") || 0);

let running = false;
let ended = true;
let entered = false;

let startAt = 0;
let frame = 0;
let lastWholeSecond = null;

let muted = localStorage.getItem("sound") === "off";

bestEl.textContent = best;
soundBtn.classList.toggle("muted", muted);

let audioCtx = null;
let master = null;

function soundEnabled() {
  return localStorage.getItem("sound") !== "off";
}

function ensureAudio() {
  if (!soundEnabled()) return;

  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return;
  }

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;

  audioCtx = new Ctx();
  master = audioCtx.createGain();
  master.gain.value = 0.10;
  master.connect(audioCtx.destination);
}

function localTone(type, f1, f2, duration, volume, delay = 0) {
  if (!soundEnabled()) return;
  ensureAudio();
  if (!audioCtx || !master) return;

  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(f1, t);
  if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t + duration);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function clickSound() {
  if (window.ShiftSound && typeof ShiftSound.play === "function") {
    ShiftSound.play("click");
  } else {
    localTone("square", 780, 250, 0.09, 0.09);
  }
}


function tickTock(second) {
  if (!soundEnabled()) return;

  ensureAudio();

  if (second % 2 === 0) {
    localTone("square", 1150, 760, 0.075, 0.15);
    localTone("triangle", 170, 105, 0.10, 0.045, 0.008);
  } else {
    localTone("square", 820, 540, 0.09, 0.15);
    localTone("triangle", 125, 80, 0.11, 0.05, 0.008);
  }
}

function endSound() {
  if (window.ShiftSound && typeof ShiftSound.play === "function") {
    ShiftSound.play("success");
  } else {
    [440, 554, 659, 880].forEach((f, i) => {
      localTone("sine", f, f * 1.01, 0.22, 0.11, i * 0.09);
    });
  }
}

function makeStreaks() {
  boltLayer.innerHTML = "";
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("div");
    s.className = "streak";
    s.style.top = Math.random() * 100 + "%";
    s.style.width = 14 + Math.random() * 30 + "vw";
    s.style.animationDuration = 0.5 + Math.random() * 0.9 + "s";
    s.style.animationDelay = -Math.random() * 1.5 + "s";
    boltLayer.appendChild(s);
  }
}

function enterGame() {
  if (entered) return;
  entered = true;
  intro.style.display = "none";
  game.classList.add("visible");
}

function beginIntro() {
  makeStreaks();
  setTimeout(() => introTitle.classList.add("show"), 180);
  setTimeout(enterGame, 1250);
}

skipBtn.addEventListener("click", () => {
  clickSound();
  enterGame();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") enterGame();
});

window.addEventListener("pointerdown", ensureAudio, { once: true });
window.addEventListener("keydown", ensureAudio, { once: true });

timeOptions.forEach(button => {
  button.addEventListener("click", () => {
    timeOptions.forEach(x => x.classList.remove("active"));
    button.classList.add("active");
    selectedTime = Number(button.dataset.time);
    sideTimeEl.textContent = selectedTime + "s";
    clickSound();
  });
});

const emptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
const key = (r, c) => r + "," + c;

function emptyCells() {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile() {
  const cells = emptyCells();
  if (!cells.length) return false;

  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  board[r][c] = Math.random() < 0.8 ? 2 : 4;
  return true;
}

function highestTile() {
  let max = 0;
  for (const row of board) {
    for (const value of row) max = Math.max(max, value);
  }
  return max;
}

function canMove() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (v === 0) return true;
      if (c < SIZE - 1 && board[r][c + 1] === v) return true;
      if (r < SIZE - 1 && board[r + 1][c] === v) return true;
    }
  }
  return false;
}

function lineCoords(dir, i) {
  const out = [];
  if (dir === "left")  for (let c = 0; c < SIZE; c++) out.push([i, c]);
  if (dir === "right") for (let c = SIZE - 1; c >= 0; c--) out.push([i, c]);
  if (dir === "up")    for (let r = 0; r < SIZE; r++) out.push([r, i]);
  if (dir === "down")  for (let r = SIZE - 1; r >= 0; r--) out.push([r, i]);
  return out;
}

function slideLine(values) {
  const tiles = values.filter(v => v !== 0);
  const out = [];
  let gained = 0;

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      const value = tiles[i] * 2;
      out.push(value);
      gained += value;
      i++;
    } else {
      out.push(tiles[i]);
    }
  }

  while (out.length < SIZE) out.push(0);
  return { line: out, gained };
}

function tileClass(v) {
  return v > 2048 ? "tile-super" : "tile-" + v;
}

function render() {
  boardEl.innerHTML = "";

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      const cell = document.createElement("div");
      cell.className = "cell";

      if (v) {
        cell.classList.add(tileClass(v));
        cell.textContent = v;
      }

      boardEl.appendChild(cell);
    }
  }

  scoreEl.textContent = score;
  moveCountEl.textContent = moves;

  if (score > best) {
    best = score;
    localStorage.setItem("shiftTimeAttackBest", best);
  }

  bestEl.textContent = best;
}

function move(dir) {
  if (!running || ended) return;

  let changed = false;
  let gained = 0;

  for (let i = 0; i < SIZE; i++) {
    const coords = lineCoords(dir, i);
    const values = coords.map(([r, c]) => board[r][c]);
    const result = slideLine(values);

    coords.forEach(([r, c], index) => {
      if (board[r][c] !== result.line[index]) changed = true;
      board[r][c] = result.line[index];
    });

    gained += result.gained;
  }

  if (!changed) return;

  moves++;
  score += gained;
  addRandomTile();
  render();

  if (window.ShiftSound && typeof ShiftSound.play === "function") {
    ShiftSound.play(gained > 0 ? "merge" : "move");
  } else {
    localTone(gained > 0 ? "sawtooth" : "triangle", gained > 0 ? 300 : 260, gained > 0 ? 640 : 340, 0.10, 0.10);
  }

  if (!canMove()) {
    finishGame("BOARD JAMMED");
  }
}

function updateTimer() {
  if (!running || ended) return;

  const elapsed = performance.now() - startAt;
  const remaining = Math.max(0, selectedTime * 1000 - elapsed);
  const seconds = Math.ceil(remaining / 1000);

  timeLeftEl.textContent = seconds;
  sideTimeEl.textContent = seconds + "s";

  const ratio = selectedTime > 0 ? remaining / (selectedTime * 1000) : 0;
  timerBar.style.width = Math.max(0, ratio * 100) + "%";

  if (seconds <= 10 && seconds > 0) {
    attackGame.classList.add("danger");

    if (seconds !== lastWholeSecond) {
      lastWholeSecond = seconds;
      tickTock(seconds);
    }
  } else {
    attackGame.classList.remove("danger");
    lastWholeSecond = null;
  }

  if (remaining <= 0) {
    finishGame("TIME'S UP");
    return;
  }

  frame = requestAnimationFrame(updateTimer);
}

function initRound() {
  if (frame) cancelAnimationFrame(frame);

  board = emptyBoard();
  score = 0;
  moves = 0;

  addRandomTile();
  addRandomTile();
  render();

  running = true;
  ended = false;
  lastWholeSecond = null;

  overlay.classList.remove("show");
  attackGame.classList.remove("danger");

  statusEl.textContent = "GO — MOVE FAST";
  timeLeftEl.textContent = selectedTime;
  sideTimeEl.textContent = selectedTime + "s";
  timerBar.style.width = "100%";

  startAt = performance.now();
  frame = requestAnimationFrame(updateTimer);
}

function startRound() {
  clickSound();
  timeSelect.style.display = "none";
  attackGame.classList.add("active");
  initRound();
}

function finishGame(message) {
  if (ended) return;

  ended = true;
  running = false;

  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  attackGame.classList.remove("danger");
  timeLeftEl.textContent = "0";
  sideTimeEl.textContent = "0s";
  timerBar.style.width = "0%";

  finalScoreEl.textContent = score;
  finalTileEl.textContent = highestTile();
  finalMovesEl.textContent = moves;
  overlayText.textContent = message === "TIME'S UP"
    ? "The final second is gone."
    : "No more moves are available.";

  statusEl.textContent = message;
  overlay.classList.add("show");

  endSound();
}

startTime.addEventListener("click", startRound);

restartBtn.addEventListener("click", () => {
  clickSound();
  initRound();
});

overlayRestart.addEventListener("click", () => {
  clickSound();
  initRound();
});

soundBtn.addEventListener("click", () => {
  muted = !muted;
  localStorage.setItem("sound", muted ? "off" : "on");
  soundBtn.classList.toggle("muted", muted);

  if (!muted) {
    ensureAudio();
    clickSound();
  }
});

const KEYMAP = {
  ArrowLeft:"left", ArrowRight:"right", ArrowUp:"up", ArrowDown:"down",
  a:"left", d:"right", w:"up", s:"down",
  A:"left", D:"right", W:"up", S:"down"
};

window.addEventListener("keydown", e => {
  const dir = KEYMAP[e.key];
  if (!dir || !running || ended) return;
  e.preventDefault();
  move(dir);
});

let touchStart = null;

boardEl.addEventListener("pointerdown", e => {
  touchStart = { x:e.clientX, y:e.clientY };
});

window.addEventListener("pointerup", e => {
  if (!touchStart || !running || ended) return;

  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;
  touchStart = null;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? "right" : "left");
  } else {
    move(dy > 0 ? "down" : "up");
  }
});

document.addEventListener("visibilitychange", () => {
  if (!running || ended) return;

  if (document.hidden) {
    const elapsed = performance.now() - startAt;
    const remaining = Math.max(0, selectedTime * 1000 - elapsed);
    window.__shiftTimeAttackPaused = remaining;
    running = false;
    statusEl.textContent = "PAUSED";
    if (frame) cancelAnimationFrame(frame);
  } else {
    const remaining = Number(window.__shiftTimeAttackPaused || selectedTime * 1000);
    startAt = performance.now() - (selectedTime * 1000 - remaining);
    running = true;
    statusEl.textContent = "GO — MOVE FAST";
    frame = requestAnimationFrame(updateTimer);
  }
});

beginIntro();
