const intro = document.getElementById("intro");
const game = document.getElementById("game");
const codeLayer = document.getElementById("codeLayer");
const terminal = document.getElementById("terminal");
const terminalText = document.getElementById("terminalText");
const introTitle = document.getElementById("introTitle");
const redFlash = document.getElementById("redFlash");
const skip = document.getElementById("skip");
const soundBtn = document.getElementById("soundBtn");

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const moveCountEl = document.getElementById("moveCount");
const statusEl = document.getElementById("status");
const undoBtn = document.getElementById("undoBtn");
const restartBtn = document.getElementById("restartBtn");

let board = [];
let previousState = null;
let score = 0;
let moves = 0;
let best = Number(localStorage.getItem("shiftDarkBest") || 0);
let audioCtx = null;
let master = null;
let muted = false;
let started = false;
let gameOver = false;
let won = false;
let sessionFinalized = false;

const darkLaugh = new Audio("audio/dark-laugh.mp3");
const darkScary = new Audio("audio/dark-zone.mp3");

darkLaugh.preload = "auto";
darkScary.preload = "auto";

function playDarkIntroSounds() {
  if (muted) return;

  darkLaugh.currentTime = 0;

  darkLaugh.onended = () => {
    darkScary.currentTime = 0;
    darkScary.play().catch(() => {});
  };

  darkLaugh.play().catch(() => {});
}

const SIZE = 4;
const BLOCK = "block";
const GLITCH = "glitch";

const snippets = [
  "const darkZone = new SHIFT.Core();",
  "SYSTEM_OVERRIDE = true;",
  "board.scan();",
  "tile.merge(2, 2);",
  "grid[3][2] ^= 0x2048;",
  "gravity.status = unstable;",
  "if (zone === DARK) {",
  "  rules.override();",
  "}",
  "WARNING: UNKNOWN SHIFT",
  "CORE.ACCESS = 2048;",
  "render.neon();",
  "sync.tiles();",
  ">>> DARK_ZONE.EXE",
  ">>> SYSTEM OVERRIDE",
  ">>> BOARD IS AWAKE",
];

function makeCode() {
  codeLayer.innerHTML = "";
  for (let i = 0; i < 48; i++) {
    const el = document.createElement("div");
    el.className = "code";
    el.textContent = snippets[Math.floor(Math.random() * snippets.length)];
    el.style.left = Math.random() * 96 - 3 + "vw";
    el.style.setProperty("--x", Math.random() * 36 - 18 + "vw");
    el.style.animationDuration = 2.1 + Math.random() * 2.6 + "s";
    el.style.animationDelay = -Math.random() * 3.5 + "s";
    el.style.fontSize = 9 + Math.random() * 5 + "px";
    codeLayer.appendChild(el);
  }
}

function startAudio() {
  if (muted) return;
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioCtx = new AudioContextClass();
  master = audioCtx.createGain();
  master.gain.value = 0.028;
  master.connect(audioCtx.destination);

  const o1 = audioCtx.createOscillator(),
    o2 = audioCtx.createOscillator();
  const g1 = audioCtx.createGain(),
    g2 = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  o1.type = "sine";
  o1.frequency.value = 48;
  o2.type = "triangle";
  o2.frequency.value = 71;
  g1.gain.value = 0.35;
  g2.gain.value = 0.13;
  filter.type = "lowpass";
  filter.frequency.value = 380;
  o1.connect(g1).connect(filter);
  o2.connect(g2).connect(filter);
  filter.connect(master);
  o1.start();
  o2.start();
}
function resumeAudio() {
  if (muted) return;
  startAudio();
  if (audioCtx && audioCtx.state === "suspended")
    audioCtx.resume().catch(() => {});
}
function tone(type, startFreq, endFreq, duration, volume) {
  if (!audioCtx || muted || !master) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  if (endFreq)
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}
function moveSound() {
  tone("square", 115, 72, 0.09, 0.045);
}
function mergeSound() {
  tone("sawtooth", 180, 420, 0.16, 0.07);
}
function glitchSound() {
  if (!audioCtx || muted || !master) return;
  const now = audioCtx.currentTime;
  const buffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate * 0.07,
    audioCtx.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = audioCtx.createBufferSource(),
    g = audioCtx.createGain();
  const f = audioCtx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1100;
  g.gain.value = 0.13;
  src.buffer = buffer;
  src.connect(f).connect(g).connect(master);
  src.start(now);
}
function shiftSound() {
  tone("sine", 90, 35, 0.28, 0.08);
  setTimeout(() => tone("sawtooth", 260, 70, 0.22, 0.055), 80);
}
function blockSound() {
  tone("square", 75, 42, 0.13, 0.055);
}
function winSound() {
  tone("sine", 220, 440, 0.18, 0.07);
  setTimeout(() => tone("sine", 330, 660, 0.22, 0.06), 110);
}

function typeText(text) {
  terminalText.textContent = "";
  let i = 0;
  const t = setInterval(() => {
    terminalText.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(t);
  }, 25);
}

function beginIntro() {
  started = true;
  startAudio();
  playDarkIntroSounds();
  makeCode();
  terminal.classList.add("show");
  typeText("INITIALIZING DARK ZONE...");
  setTimeout(() => typeText("OVERRIDING CLASSIC RULES..."), 800);
  setTimeout(() => typeText("ACCESS GRANTED / CORE 2048"), 1700);
  setTimeout(() => {
    terminal.classList.remove("show");
    glitchSound();
    introTitle.classList.add("show");
  }, 2500);
  setTimeout(() => {
    redFlash.classList.add("go");
    glitchSound();
  }, 3500);
  setTimeout(showGame, 3900);
}
function showGame() {
  intro.style.display = "none";
  game.classList.add("visible");
  initGame();
}
function skipIntro() {
  if (!started) started = true;
  intro.style.display = "none";
  game.classList.add("visible");
  initGame();
}
skip.addEventListener("click", skipIntro);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") skipIntro();
});

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}
function clone(b) {
  return b.map((row) =>
    row.map((cell) => (cell === null ? null : { ...cell })),
  );
}
function snapshot() {
  return { board: clone(board), score, moves, gameOver, won };
}
function restore(state) {
  board = clone(state.board);
  score = state.score;
  moves = state.moves;
  gameOver = state.gameOver;
  won = state.won;
}
function isTile(cell) {
  return cell && cell.type === "tile";
}
function tile(value) {
  return { type: "tile", value };
}
function addRandomTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r][c] === null) empty.push([r, c]);
  if (!empty.length) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = tile(Math.random() < 0.9 ? 2 : 4);
  return true;
}
function countSpecial(type) {
  let n = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r][c]?.type === type) n++;
  return n;
}
function addBlock() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r][c] === null) empty.push([r, c]);
  if (!empty.length) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = { type: BLOCK };
  return true;
}
function addGlitch() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r][c] === null) empty.push([r, c]);
  if (!empty.length) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = { type: GLITCH };
  return true;
}
function getHighestTile() {
  let max = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const cell = board[r][c];
      if (isTile(cell) && cell.value > max) max = cell.value;
    }
  return max;
}

function saveRunToLeaderboard() {
  if (sessionFinalized || moves === 0) return;

  let runs = [];
  try {
    runs = JSON.parse(localStorage.getItem("shift2048_history")) || [];
  } catch (e) {
    runs = [];
  }

  const tile = getHighestTile();
  runs.unshift({
    score: score,
    moves: moves,
    tile: tile,
    won: won,
    mode: "dark-zone",
    date: Date.now(),
  });

  if (runs.length > 50) runs = runs.slice(0, 50);
  localStorage.setItem("shift2048_history", JSON.stringify(runs));

  const gamesPlayed =
    Number(localStorage.getItem("shift2048_gamesPlayed") || 0) + 1;
  localStorage.setItem("shift2048_gamesPlayed", gamesPlayed);

  if (tile > Number(localStorage.getItem("shift2048_bestTile") || 0)) {
    localStorage.setItem("shift2048_bestTile", tile);
  }

  sessionFinalized = true;
}

function initGame() {
  board = emptyBoard();
  score = 0;
  moves = 0;
  previousState = null;
  gameOver = false;
  won = false;
  sessionFinalized = false;
  addRandomTile();
  addRandomTile();
  statusEl.textContent = "STABLE";
  render();
  updateUndo();
}
function tileClass(v) {
  if (v >= 2048) return "tile-2048";
  return `tile-${v}`;
}
function render() {
  boardEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const cellData = board[r][c];
      const cell = document.createElement("div");
      cell.className = "cell";
      if (cellData?.type === BLOCK) {
        cell.classList.add("blocked");
        cell.innerHTML = '<span class="lock">×</span><small>LOCK</small>';
      } else if (cellData?.type === GLITCH) {
        cell.classList.add("glitch-tile");
        cell.innerHTML = "<span>?</span><small>GLITCH</small>";
      } else if (isTile(cellData)) {
        cell.classList.add(tileClass(cellData.value));
        cell.textContent = cellData.value;
      }
      boardEl.appendChild(cell);
    }
  scoreEl.textContent = score;
  best = Math.max(best, score);
  bestEl.textContent = best;
  if (moveCountEl) moveCountEl.textContent = moves;
  localStorage.setItem("shiftDarkBest", best);
}

function lineForMove(dir, index) {
  const coords = [];
  if (dir === "left") for (let c = 0; c < SIZE; c++) coords.push([index, c]);
  if (dir === "right")
    for (let c = SIZE - 1; c >= 0; c--) coords.push([index, c]);
  if (dir === "up") for (let r = 0; r < SIZE; r++) coords.push([r, index]);
  if (dir === "down")
    for (let r = SIZE - 1; r >= 0; r--) coords.push([r, index]);
  return coords;
}

function processLine(coords) {
  const before = coords.map(([r, c]) => board[r][c]);
  const segments = [];
  let segment = [];
  for (const coord of coords) {
    const cell = board[coord[0]][coord[1]];
    if (cell?.type === BLOCK) {
      if (segment.length) segments.push(segment);
      segments.push([coord]);
      segment = [];
    } else segment.push(coord);
  }
  if (segment.length) segments.push(segment);

  let gained = 0,
    merged = false,
    changed = false;
  for (const seg of segments) {
    if (seg.length === 1 && board[seg[0][0]][seg[0][1]]?.type === BLOCK)
      continue;
    const items = [];
    for (const [r, c] of seg) {
      const cell = board[r][c];
      if (cell?.type === GLITCH) items.push({ coord: [r, c], cell });
      else if (isTile(cell)) items.push({ coord: [r, c], cell });
    }
    const normal = items.filter((x) => x.cell.type === "tile");
    const glitch = items.filter((x) => x.cell.type === GLITCH);
    const values = [];
    for (const item of normal)
      values.push({ value: item.cell.value, source: item });

    const out = [];
    for (let i = 0; i < values.length; i++) {
      const a = values[i];
      const b = values[i + 1];
      if (b && a.value === b.value) {
        out.push({ type: "tile", value: a.value * 2 });
        gained += a.value * 2;
        merged = true;
        i++;
      } else out.push({ type: "tile", value: a.value });
    }

    const glitchedOut = [];
    for (const g of glitch) {
      const value = Math.random() < 0.55 ? 4 : 8;
      glitchedOut.push({ type: "tile", value });
      if (Math.random() < 0.28) gained = Math.max(0, gained - 20);
    }
    const combined = out.concat(glitchedOut);
    for (let i = 0; i < seg.length; i++) {
      const coord = seg[i];
      const next = combined[i] || null;
      const old = board[coord[0]][coord[1]];
      if (JSON.stringify(old) !== JSON.stringify(next)) changed = true;
      board[coord[0]][coord[1]] = next;
    }
  }
  score += gained;
  return { changed, gained, merged };
}

function shiftBoard(dir) {
  let changed = false,
    gained = 0,
    merged = false;
  for (let i = 0; i < SIZE; i++) {
    const result = processLine(lineForMove(dir, i));
    changed ||= result.changed;
    gained += result.gained;
    merged ||= result.merged;
  }
  return { changed, gained, merged };
}

function randomEmpty() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r][c] === null) empty.push([r, c]);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
}

function performBoardShift() {
  const horizontal = Math.random() < 0.5;
  const index = Math.floor(Math.random() * SIZE);
  if (horizontal) {
    const row = board[index].slice();
    if (Math.random() < 0.5) row.unshift(row.pop());
    else row.push(row.shift());
    board[index] = row;
    statusEl.textContent = `SHIFT ROW ${index + 1}`;
  } else {
    const col = [];
    for (let r = 0; r < SIZE; r++) col.push(board[r][index]);
    if (Math.random() < 0.5) col.unshift(col.pop());
    else col.push(col.shift());
    for (let r = 0; r < SIZE; r++) board[r][index] = col[r];
    statusEl.textContent = `SHIFT COL ${index + 1}`;
  }
  shiftSound();
  boardEl.classList.remove("board-shift");
  void boardEl.offsetWidth;
  boardEl.classList.add("board-shift");
}

function specialEvent() {
  if (moves % 4 === 0) {
    if (countSpecial(BLOCK) < 2 && addBlock()) {
      statusEl.textContent = "LOCK DEPLOYED";
      blockSound();
    }
  }
  if (moves % 5 === 0) {
    if (countSpecial(GLITCH) < 1 && addGlitch()) {
      statusEl.textContent = "GLITCH DETECTED";
      glitchSound();
    }
  }
  if (moves % 8 === 0) {
    performBoardShift();
  }
}

function has2048() {
  return board.some((row) =>
    row.some((cell) => isTile(cell) && cell.value >= 2048),
  );
}
function canMove() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === null) return true;
      if (!isTile(board[r][c])) continue;
      if (
        c < SIZE - 1 &&
        isTile(board[r][c + 1]) &&
        board[r][c].value === board[r][c + 1].value
      )
        return true;
      if (
        r < SIZE - 1 &&
        isTile(board[r + 1][c]) &&
        board[r][c].value === board[r + 1][c].value
      )
        return true;
    }
  return false;
}
function move(dir) {
  if (gameOver || won) return;
  resumeAudio();
  const before = snapshot();
  const result = shiftBoard(dir);
  if (!result.changed) return;

  previousState = before;
  moves++;
  addRandomTile();
  specialEvent();

  if (has2048()) {
    won = true;
    saveRunToLeaderboard();
    statusEl.textContent = "CORE REACHED";
    winSound();
  } else if (!canMove()) {
    gameOver = true;
    saveRunToLeaderboard();
    statusEl.textContent = "ZONE LOCKED";
    glitchSound();
  } else if (moves % 8 !== 0 && moves % 5 !== 0 && moves % 4 !== 0) {
    statusEl.textContent = score >= 1000 ? "CORRUPTED" : "STABLE";
    if (result.merged) mergeSound();
    else moveSound();
  } else if (result.merged) mergeSound();

  render();
  updateUndo();
}
function undo() {
  resumeAudio();
  if (!previousState) return;
  restore(previousState);
  previousState = null;
  statusEl.textContent = "ROLLBACK COMPLETE";
  render();
  updateUndo();
  glitchSound();
}
function updateUndo() {
  undoBtn.disabled = !previousState;
}

window.addEventListener("keydown", (e) => {
  const map = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "up",
    s: "down",
    A: "left",
    D: "right",
    W: "up",
    S: "down",
  };
  if (map[e.key]) {
    e.preventDefault();
    move(map[e.key]);
  }
});
undoBtn.addEventListener("click", undo);
restartBtn.addEventListener("click", () => {
  resumeAudio();
  saveRunToLeaderboard();
  initGame();
  glitchSound();
});
soundBtn.addEventListener("click", () => {
  muted = !muted;
  soundBtn.classList.toggle("muted", muted);
  if (muted) {
    if (audioCtx && master)
      master.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);
  } else {
    startAudio();
    if (master) master.gain.setTargetAtTime(0.028, audioCtx.currentTime, 0.08);
    glitchSound();
  }
});

window.addEventListener("pointerdown", resumeAudio, { once: true });
window.addEventListener("keydown", resumeAudio, { once: true });

bestEl.textContent = best;
beginIntro();

window.addEventListener("pagehide", saveRunToLeaderboard);
