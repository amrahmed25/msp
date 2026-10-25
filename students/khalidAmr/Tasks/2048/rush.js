
const intro = document.getElementById("intro");
const game = document.getElementById("game");
const boltLayer = document.getElementById("boltLayer");
const introTitle = document.getElementById("introTitle");
const flashEl = document.getElementById("flash");
const skipBtn = document.getElementById("skip");
const soundBtn = document.getElementById("soundBtn");

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const moveCountEl = document.getElementById("moveCount");
const statusEl = document.getElementById("status");
const comboMultEl = document.getElementById("comboMult");
const comboPipsEl = document.getElementById("comboPips");
const speedLevelEl = document.getElementById("speedLevel");
const restartBtn = document.getElementById("restartBtn");
const timerEl = document.querySelector(".timer");
const timerBar = document.getElementById("timerBar");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const finalScoreEl = document.getElementById("finalScore");
const finalTileEl = document.getElementById("finalTile");
const finalMovesEl = document.getElementById("finalMoves");
const overlayRestart = document.getElementById("overlayRestart");

const SIZE = 4;
const BASE_MS = 3600;      
const MIN_MS = 1800;       
const STEP_MS = 200;       
const STEP_MOVES = 15;     
const COMBO_STEP = 5;      
const MAX_MULT = 4;
const QUICK_RATIO = 0.45; 

let board = [];
let score = 0;
let moves = 0;
let combo = 0;
let ended = true;
let finalized = false;
let running = false;
let entered = false;

let timerOn = false;
let paused = false;
let pausedLeft = 0;
let deadline = 0;
let windowMs = BASE_MS;

let newPos = new Set();
let mergedPos = new Set();

const num = key => { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) ? v : 0; };
let best = num("shiftRushBest");

let muted = localStorage.getItem("sound") === "off";
if (localStorage.getItem("animations") === "off") document.body.classList.add("no-anim");
soundBtn.classList.toggle("muted", muted);

let audioCtx = null;
let master = null;
function ensureAudio() {
  if (muted) return;
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioCtx = new Ctx();
  master = audioCtx.createGain();
  master.gain.value = 0.04;
  master.connect(audioCtx.destination);
}
function tone(type, f1, f2, dur, vol, delay = 0) {
  if (!audioCtx || muted || !master) return;
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t);
  if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}
const moveSound  = () => tone("triangle", 260, 340, 0.07, 0.5);
const mergeSound = () => tone("sawtooth", 300, 640, 0.14, 0.5);
const zapSound   = () => { tone("sawtooth", 900, 90, 0.22, 0.6); tone("square", 140, 60, 0.18, 0.4, 0.04); };
const comboSound = () => [520, 660, 880].forEach((f, i) => tone("sine", f, f * 1.02, 0.12, 0.6, i * 0.06));
const winSound   = () => [440, 554, 659, 880].forEach((f, i) => tone("sine", f, f * 1.01, 0.22, 0.7, i * 0.1));
const overSound  = () => tone("sawtooth", 320, 50, 0.6, 0.55);

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
function beginIntro() {
  makeStreaks();
  ensureAudio();
  setTimeout(() => { introTitle.classList.add("show"); zapSound(); }, 250);
  setTimeout(() => { flashEl.classList.add("go"); zapSound(); }, 1500);
  setTimeout(enterGame, 1850);
}
function enterGame() {
  if (entered) return;
  entered = true;
  intro.style.display = "none";
  game.classList.add("visible");
  initGame();
  requestAnimationFrame(tick);
}
skipBtn.addEventListener("click", enterGame);

const emptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
const key = (r, c) => r + "," + c;

function emptyCells() {
  const list = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === 0) list.push([r, c]);
  return list;
}
function addRandomTile() {
  const empty = emptyCells();
  if (!empty.length) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.8 ? 2 : 4;  
  newPos.add(key(r, c));
  return true;
}
function highestTile() {
  let max = 0;
  for (const row of board) for (const v of row) if (v > max) max = v;
  return max;
}
function has2048() { return highestTile() >= 2048; }
function canMove() {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const v = board[r][c];
    if (v === 0) return true;
    if (c < SIZE - 1 && board[r][c + 1] === v) return true;
    if (r < SIZE - 1 && board[r + 1][c] === v) return true;
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
  const mergedIdx = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      const v = tiles[i] * 2;
      out.push(v);
      mergedIdx.push(out.length - 1);
      gained += v;
      i++;
    } else out.push(tiles[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { line: out, gained, mergedIdx };
}

function level() { return Math.min(1 + Math.floor(moves / STEP_MOVES), (BASE_MS - MIN_MS) / STEP_MS + 1); }
function currentWindow() { return Math.max(MIN_MS, BASE_MS - Math.floor(moves / STEP_MOVES) * STEP_MS); }
function multiplier() { return Math.min(MAX_MULT, 1 + Math.floor(combo / COMBO_STEP)); }

function resetClock() {
  windowMs = currentWindow();
  deadline = performance.now() + windowMs;
  timerEl.classList.remove("danger");
  timerBar.style.transform = "scaleX(1)";
}
function tick() {
  requestAnimationFrame(tick);
  if (!timerOn || paused || ended) return;
  const now = performance.now();
  const left = deadline - now;
  if (left <= 0) { onTimeout(); return; }
  const ratio = left / windowMs;
  timerBar.style.transform = "scaleX(" + ratio + ")";
  timerEl.classList.toggle("danger", ratio < 0.3);
}
function onTimeout() {
  combo = 0;
  newPos.clear(); mergedPos.clear();
  addRandomTile();
  statusEl.textContent = "TOO SLOW — TILE DROPPED";
  zapSound();
  boardEl.classList.remove("rushed");
  void boardEl.offsetWidth;
  boardEl.classList.add("rushed");
  resetClock();
  render();
  if (!canMove()) endGame(false);
}

function finalize(won) {
  if (finalized || moves === 0) return;
  finalized = true;

  let runs = [];
  try { runs = JSON.parse(localStorage.getItem("shift2048_history")) || []; } catch (e) { runs = []; }
  const tile = highestTile();
  runs.unshift({ score, moves, tile, won: !!won, mode: "rush", date: Date.now() });
  if (runs.length > 50) runs = runs.slice(0, 50);
  localStorage.setItem("shift2048_history", JSON.stringify(runs));

  localStorage.setItem("shift2048_gamesPlayed", num("shift2048_gamesPlayed") + 1);
  if (tile > num("shift2048_bestTile")) localStorage.setItem("shift2048_bestTile", tile);
  if (score > num("shift2048_best")) localStorage.setItem("shift2048_best", score);

  const streak = won ? num("shift2048_winStreak") + 1 : 0;
  localStorage.setItem("shift2048_winStreak", streak);
  if (streak > num("shift2048_bestWinStreak")) localStorage.setItem("shift2048_bestWinStreak", streak);
}

function initGame() {
  board = emptyBoard();
  score = 0; moves = 0; combo = 0;
  ended = false; finalized = false; running = true;
  timerOn = false; paused = false;
  newPos.clear(); mergedPos.clear();
  addRandomTile(); addRandomTile();
  windowMs = BASE_MS;
  timerEl.classList.remove("danger");
  timerBar.style.transform = "scaleX(1)";
  statusEl.textContent = "READY — MAKE A MOVE";
  overlay.classList.remove("show");
  render();
}
function endGame(won) {
  ended = true;
  timerOn = false;
  timerEl.classList.remove("danger");
  finalize(won);
  finalScoreEl.textContent = score;
  finalTileEl.textContent = highestTile();
  finalMovesEl.textContent = moves;
  if (won) {
    overlayTitle.textContent = "2048 REACHED";
    overlayText.textContent = "You outran the clock.";
    statusEl.textContent = "RUSH COMPLETE";
    winSound();
  } else {
    overlayTitle.textContent = "RUSH OVER";
    overlayText.textContent = "The board is jammed.";
    statusEl.textContent = "BOARD JAMMED";
    overSound();
  }
  overlay.classList.add("show");
}
function restart() {
  ensureAudio();
  finalize(false);
  initGame();
  zapSound();
}

function move(dir) {
  if (!running || ended || paused) return;
  ensureAudio();

  let gained = 0;
  let changed = false;
  let didMerge = false;
  const merged = new Set();

  for (let i = 0; i < SIZE; i++) {
    const coords = lineCoords(dir, i);
    const res = slideLine(coords.map(([r, c]) => board[r][c]));
    coords.forEach(([r, c], k) => {
      if (board[r][c] !== res.line[k]) changed = true;
      board[r][c] = res.line[k];
    });
    res.mergedIdx.forEach(k => merged.add(key(coords[k][0], coords[k][1])));
    if (res.mergedIdx.length) didMerge = true;
    gained += res.gained;
  }
  if (!changed) return;

  const quick = !timerOn || (deadline - performance.now()) > windowMs * QUICK_RATIO;
  const lostCombo = !quick && combo > 0;
  if (!quick) combo = 0;

  const prevMult = multiplier();
  moves++;
  combo++;
  const mult = multiplier();
  score += gained * mult;

  newPos.clear();
  mergedPos = merged;
  addRandomTile();

  if (!timerOn) timerOn = true;
  resetClock();

  if (mult > prevMult) { statusEl.textContent = "COMBO x" + mult + "!"; comboSound(); }
  else if (lostCombo)  { statusEl.textContent = "SLOW — COMBO LOST"; didMerge ? mergeSound() : moveSound(); }
  else if (didMerge)   { statusEl.textContent = "RUSHING x" + mult; mergeSound(); }
  else                 { statusEl.textContent = "RUSHING x" + mult; moveSound(); }

  render();

  if (has2048()) endGame(true);
  else if (!canMove()) endGame(false);
}

function tileClass(v) { return v > 2048 ? "tile-super" : "tile-" + v; }
function render() {
  boardEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const v = board[r][c];
    const cell = document.createElement("div");
    cell.className = "cell";
    if (v) {
      cell.classList.add(tileClass(v));
      cell.textContent = v;
      if (newPos.has(key(r, c))) cell.classList.add("new");
      if (mergedPos.has(key(r, c))) cell.classList.add("merged");
    }
    boardEl.appendChild(cell);
  }
  newPos = new Set();
  mergedPos = new Set();

  if (score > best) { best = score; localStorage.setItem("shiftRushBest", best); }
  scoreEl.textContent = score;
  bestEl.textContent = best;
  moveCountEl.textContent = moves;

  const mult = multiplier();
  comboMultEl.textContent = "x" + mult;
  speedLevelEl.textContent = "LV " + level();
  const lit = mult >= MAX_MULT ? COMBO_STEP : combo % COMBO_STEP;
  [...comboPipsEl.children].forEach((pip, i) => pip.classList.toggle("on", i < lit));
}

const KEYMAP = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
  a: "left", d: "right", w: "up", s: "down",
  A: "left", D: "right", W: "up", S: "down"
};
window.addEventListener("keydown", e => {
  if (e.key === "Escape") { enterGame(); return; }
  const dir = KEYMAP[e.key];
  if (dir) { e.preventDefault(); move(dir); }
});

let touchStart = null;
boardEl.addEventListener("pointerdown", e => { touchStart = { x: e.clientX, y: e.clientY }; });
window.addEventListener("pointerup", e => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
  else move(dy > 0 ? "down" : "up");
});

restartBtn.addEventListener("click", restart);
overlayRestart.addEventListener("click", restart);

soundBtn.addEventListener("click", () => {
  muted = !muted;
  localStorage.setItem("sound", muted ? "off" : "on");
  soundBtn.classList.toggle("muted", muted);
  if (!muted) { ensureAudio(); comboSound(); }
});

document.addEventListener("visibilitychange", () => {
  if (!timerOn || ended) return;
  if (document.hidden) {
    paused = true;
    pausedLeft = Math.max(0, deadline - performance.now());
  } else {
    deadline = performance.now() + pausedLeft;
    paused = false;
  }
});

window.addEventListener("pointerdown", ensureAudio, { once: true });
window.addEventListener("keydown", ensureAudio, { once: true });
window.addEventListener("pagehide", () => finalize(false));

bestEl.textContent = best;
beginIntro();
