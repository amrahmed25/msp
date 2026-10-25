let soundOn = window.ShiftMusic ? window.ShiftMusic.isEnabled() : true;
let audioCtx = null;

const toast = document.getElementById('toast');
const soundBtn = document.getElementById('soundBtn');
const profileBtn = document.getElementById('profileBtn');

function tone(f = 560, d = .08) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.035, audioCtx.currentTime + .01);
    g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + d);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + d);
  } catch (e) {}
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.lbToastTimer);
  window.lbToastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

if (soundBtn) {
  if (!soundOn) {
    soundBtn.classList.add('sound-off');
    soundBtn.setAttribute('aria-label', 'Turn sound on');
  }
  soundBtn.onclick = () => {
    soundOn = !soundOn;
    soundBtn.classList.toggle('sound-off', !soundOn);
    soundBtn.setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on');
    if (window.ShiftMusic) window.ShiftMusic.setEnabled(soundOn);
    if (soundOn) tone(600, .08);
  };
}

if (profileBtn) {
  profileBtn.onclick = () => showToast('Profile menu');
}

function readNumber(key) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : 0;
}

function readHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem('shift2048_history'));
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}

function tileGradient(value) {
  if (value >= 2048) return 'linear-gradient(145deg,#28bfff,#4d45ff)';
  if (value >= 1024) return 'linear-gradient(145deg,#ef6a52,#dd2f92)';
  if (value >= 512) return 'linear-gradient(145deg,#e5406a,#c021d2)';
  if (value >= 256) return 'linear-gradient(145deg,#dd2f92,#9a3ad6)';
  if (value >= 128) return 'linear-gradient(145deg,#d346c9,#7c4ff5)';
  if (value >= 64) return 'linear-gradient(145deg,#b929c9,#5b3ae8)';
  if (value >= 32) return 'linear-gradient(145deg,#9a3ad6,#3457e0)';
  if (value >= 16) return 'linear-gradient(145deg,#7c4ff5,#29316d)';
  if (value >= 8) return 'linear-gradient(145deg,#5b3ae8,#29316d)';
  if (value >= 4) return 'linear-gradient(145deg,#3457e0,#29316d)';
  return 'linear-gradient(145deg,#42405f,#29316d)';
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatMode(mode) {
  if (!mode) return 'CLASSIC';
  return mode.replace(/-/g, ' ').toUpperCase();
}

const rowsContainer = document.getElementById('lbRows');
const tableEl = document.getElementById('lbTable');
const emptyEl = document.getElementById('lbEmpty');
const tabs = document.querySelectorAll('.lb-tab');
const clearBtn = document.getElementById('lbClear');

let currentFilter = 'all';

function renderSummary() {
  document.getElementById('sumBest').textContent = readNumber('shift2048_best');
  const bestTile = readNumber('shift2048_bestTile');
  document.getElementById('sumTile').textContent = bestTile > 0 ? bestTile : '—';
  document.getElementById('sumGames').textContent = readNumber('shift2048_gamesPlayed');
  document.getElementById('sumStreak').textContent = readNumber('shift2048_winStreak');
  document.getElementById('sumBestStreak').textContent = readNumber('shift2048_bestWinStreak');
}

function renderRows() {
  const history = readHistory();
  const filtered = currentFilter === 'won' ? history.filter(entry => entry.won) : history.slice();
  filtered.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (filtered.length === 0) {
    tableEl.style.display = 'none';
    emptyEl.classList.add('show');
    rowsContainer.innerHTML = '';
    return;
  }

  tableEl.style.display = '';
  emptyEl.classList.remove('show');

  rowsContainer.innerHTML = filtered.map((entry, index) => {
    const rank = index + 1;
    const medalClass = rank === 1 ? 'medal-1' : rank === 2 ? 'medal-2' : rank === 3 ? 'medal-3' : '';
    const rowTopClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
    const tile = entry.tile || 0;
    const resultClass = entry.won ? 'won' : 'lost';
    const resultLabel = entry.won ? 'WON' : 'LOST';

    return '<div class="lb-row ' + rowTopClass + '">' +
      '<span><span class="lb-rank ' + medalClass + '">' + rank + '</span></span>' +
      '<span class="lb-score">' + (entry.score || 0) + '</span>' +
      '<span><span class="lb-tile-chip" style="background:' + tileGradient(tile) + '">' + tile + '</span></span>' +
      '<span>' + (entry.moves || 0) + '</span>' +
      '<span class="lb-mode">' + formatMode(entry.mode) + '</span>' +
      '<span><span class="lb-result ' + resultClass + '">' + resultLabel + '</span></span>' +
      '<span class="lb-date">' + formatDate(entry.date) + '</span>' +
      '</div>';
  }).join('');
}

function renderAll() {
  renderSummary();
  renderRows();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('sel'));
    tab.classList.add('sel');
    currentFilter = tab.dataset.filter;
    tone(520, .06);
    renderRows();
  });
});

clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all saved runs from this device? Your best score stays.')) return;
  localStorage.removeItem('shift2048_history');
  tone(300, .12);
  showToast('Leaderboard cleared');
  renderRows();
});

renderAll();
