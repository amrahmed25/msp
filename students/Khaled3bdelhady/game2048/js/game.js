(function () {
    'use strict';

    const MODE = new URLSearchParams(location.search).get('mode') === 'fruits' ? 'fruits' : 'numbers';
    const SIZE = 4;
    const WIN_VALUE = 2048;
    const MOVE_MS = 115;

    const FRUITS = [
        { name: 'Blueberry', img: '1-blueberry' },
        { name: 'Blackberry', img: '2-blackberry' },
        { name: 'Cherry', emoji: '🍒' },
        { name: 'Strawberry', emoji: '🍓' },
        { name: 'Peach', emoji: '🍑' },
        { name: 'Apple', emoji: '🍎' },
        { name: 'Pineapple', emoji: '🍍' },
        { name: 'Watermelon', emoji: '🍉' },
        { name: 'Berry Jar', img: '3-jar' },
        { name: 'Berry Cake', img: '4-cake' },
        { name: 'Blueberry Pie', img: '5-pie' }
    ];

    const KEY_BEST = 'mb_best_' + MODE;
    const KEY_SAVE = 'mb_game_' + MODE;

    const $ = (id) => document.getElementById(id);
    const boardEl = $('board');
    const layer = $('tileLayer');
    const scoreEl = $('score');
    const bestEl = $('best');
    const nextEl = $('nextTile');

    let grid, score, best, nextVal, won, keepGoing, over, busy, generation = 0;

    function contentHTML(v) {
        if (MODE === 'numbers') {
            return '<span class="tile-num d' + String(v).length + '">' + v + '</span>';
        }
        const level = Math.min(Math.log2(v), FRUITS.length);
        const f = FRUITS[level - 1];
        const face = f.img
            ? '<img src="images/fruits/' + f.img + '.png" alt="' + f.name + '" draggable="false">'
            : '<span class="tile-emoji">' + f.emoji + '</span>';
        return face + '<span class="tile-badge">' + v + '</span>';
    }

    function tileClass(v) {
        return 'game-tile pie-' + Math.min(v, 2048);
    }

    function paint(t) {
        t.inner.className = tileClass(t.v);
        t.inner.innerHTML = contentHTML(t.v);
    }

    function place(t) {
        t.el.style.setProperty('--x', t.c);
        t.el.style.setProperty('--y', t.r);
    }

    function makeTile(v, r, c, animate) {
        const el = document.createElement('div');
        el.className = 'tile';
        const inner = document.createElement('div');
        el.appendChild(inner);
        const t = { v: v, r: r, c: c, el: el, inner: inner, merged: false };
        paint(t);
        place(t);
        if (animate) inner.classList.add('spawn');
        layer.appendChild(el);
        grid[r][c] = t;
        return t;
    }

    function renderNext() {
        nextEl.innerHTML = '<div class="' + tileClass(nextVal) + '">' + contentHTML(nextVal) + '</div>';
    }

    function updateScore(gained) {
        scoreEl.textContent = score;
        if (score > best) {
            best = score;
            MB.write(localStorage, KEY_BEST, best);
        }
        bestEl.textContent = best;
        if (gained) {
            const pop = document.createElement('span');
            pop.className = 'score-add';
            pop.textContent = '+' + gained;
            scoreEl.parentElement.appendChild(pop);
            setTimeout(() => pop.remove(), 700);
        }
    }

    const rollNext = () => (Math.random() < 0.9 ? 2 : 4);
    const emptyGrid = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

    function spawn() {
        const empty = [];
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) empty.push([r, c]);
        if (!empty.length) return;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        makeTile(nextVal, r, c, true);
        nextVal = rollNext();
        renderNext();
    }

    function canMove() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (!t) return true;
                if (c < SIZE - 1 && grid[r][c + 1] && grid[r][c + 1].v === t.v) return true;
                if (r < SIZE - 1 && grid[r + 1][c] && grid[r + 1][c].v === t.v) return true;
            }
        }
        return false;
    }

    function move(dir) {
        if (busy || over) return;

        const vec = { left: [0, -1], right: [0, 1], up: [-1, 0], down: [1, 0] }[dir];
        const rows = [0, 1, 2, 3], cols = [0, 1, 2, 3];
        if (vec[0] === 1) rows.reverse();
        if (vec[1] === 1) cols.reverse();

        let moved = false, gained = 0;
        const merges = [];

        rows.forEach((r) => cols.forEach((c) => {
            const t = grid[r][c];
            if (!t) return;

            let nr = r, nc = c, target = null;
            for (;;) {
                const pr = nr + vec[0], pc = nc + vec[1];
                if (pr < 0 || pr >= SIZE || pc < 0 || pc >= SIZE) break;
                const o = grid[pr][pc];
                if (!o) { nr = pr; nc = pc; continue; }
                if (o.v === t.v && !o.merged) target = o;
                break;
            }

            if (target) {
                grid[r][c] = null;
                t.r = target.r; t.c = target.c;
                place(t);
                target.merged = true;
                target.v *= 2;
                gained += target.v;
                merges.push([t, target]);
                moved = true;
            } else if (nr !== r || nc !== c) {
                grid[r][c] = null;
                grid[nr][nc] = t;
                t.r = nr; t.c = nc;
                place(t);
                moved = true;
            }
        }));

        if (!moved) return;

        busy = true;
        const gen = generation;
        score += gained;
        updateScore(gained);

        setTimeout(() => {
            if (gen !== generation) return;

            let reached = false;
            merges.forEach(([gone, target], i) => {
                MB.sfx.merge(Math.log2(target.v), Math.min(i, 3) * 0.05);
                gone.el.remove();
                paint(target);
                void target.inner.offsetWidth;
                target.inner.classList.add('merged');
                if (target.v === WIN_VALUE) reached = true;
            });
            grid.forEach(row => row.forEach(t => { if (t) t.merged = false; }));

            spawn();
            busy = false;

            if (reached && !won) {
                won = true;
                save();
                setTimeout(showWin, 350);
            } else if (!canMove()) {
                over = true;
                localStorage.removeItem(KEY_SAVE);
                setTimeout(showGameOver, 450);
            } else {
                save();
            }
        }, MOVE_MS);
    }

    function save() {
        MB.write(localStorage, KEY_SAVE, {
            cells: grid.map(row => row.map(t => (t ? t.v : 0))),
            score: score, nextVal: nextVal, won: won, keepGoing: keepGoing
        });
    }

    function load() {
        const s = MB.read(localStorage, KEY_SAVE);
        if (!s || !Array.isArray(s.cells) || s.cells.length !== SIZE) return false;
        const ok = s.cells.every(row => Array.isArray(row) && row.length === SIZE &&
            row.every(v => v === 0 || (Number.isInteger(Math.log2(v)) && v >= 2)));
        if (!ok) return false;

        layer.innerHTML = '';
        grid = emptyGrid();
        s.cells.forEach((row, r) => row.forEach((v, c) => { if (v) makeTile(v, r, c, false); }));
        score = Number(s.score) || 0;
        nextVal = s.nextVal === 4 ? 4 : 2;
        won = !!s.won;
        keepGoing = !!s.keepGoing;
        over = false;
        if (!canMove()) return false;
        renderNext();
        updateScore();
        return true;
    }

    function newGame() {
        generation++;
        busy = false; over = false; won = false; keepGoing = false;
        document.querySelectorAll('.mb-modal-overlay').forEach(m => m.remove());
        layer.innerHTML = '';
        grid = emptyGrid();
        score = 0;
        nextVal = rollNext();
        spawn();
        spawn();
        updateScore();
        save();
    }

    function showWin() {
        const fruit = MODE === 'fruits';
        MB.sfx.win();
        MB.modal({
            image: fruit ? 'images/fruits/5-pie.png' : 'images/png.png',
            title: fruit ? 'You baked the Blueberry Pie!' : 'You reached 2048!',
            text: fruit ? 'The ultimate feast is served. Keep merging for a higher score?' : 'Amazing! Keep going for a higher score?',
            dismissible: false,
            buttons: [
                { label: 'Keep going', primary: true, onClick: () => { keepGoing = true; save(); } },
                { label: 'New game', onClick: newGame }
            ]
        });
    }

    function showGameOver() {
        MB.sfx.over();
        MB.modal({
            icon: '😵',
            title: 'Game over',
            text: 'No more moves.\nScore: ' + score + '   Best: ' + best,
            dismissible: false,
            buttons: [
                { label: 'Try again', primary: true, onClick: newGame },
                { label: 'Change mode', onClick: () => { location.href = 'mode.html'; } }
            ]
        });
    }

    const KEYS = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
        A: 'left', D: 'right', W: 'up', S: 'down'
    };

    document.addEventListener('keydown', (e) => {
        const dir = KEYS[e.key];
        if (!dir || e.ctrlKey || e.metaKey || e.altKey) return;
        if (document.querySelector('.mb-modal-overlay')) return;
        e.preventDefault();
        move(dir);
    });

    let sx = 0, sy = 0, tracking = false;
    boardEl.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; tracking = true; });
    boardEl.addEventListener('pointercancel', () => { tracking = false; });
    window.addEventListener('pointerup', (e) => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    });

    function buildStaticUI() {
        for (let i = 0; i < SIZE * SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            boardEl.insertBefore(cell, layer);
        }

        const isFruit = MODE === 'fruits';
        document.body.classList.add('mode-' + MODE);
        $('modeTitle').textContent = isFruit ? 'Fruits & Food' : 'Numbers';
        document.title = 'MergeBite 2048 - ' + (isFruit ? 'Fruits & Food' : 'Numbers');
        $('goal').textContent = isFruit
            ? 'Merge two identical treats to grow them. Reach the Blueberry Pie!'
            : 'Join equal tiles to reach 2048. Swipe or use the arrow keys / WASD.';

        const chain = $('chain');
        for (let i = 1; i <= 11; i++) {
            const v = Math.pow(2, i);
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.title = isFruit ? FRUITS[i - 1].name + ' (' + v + ')' : String(v);
            chip.innerHTML = '<div class="' + tileClass(v) + '">' + contentHTML(v) + '</div>';
            chain.appendChild(chip);
        }
    }

    buildStaticUI();
    best = MB.read(localStorage, KEY_BEST, 0);
    bestEl.textContent = best;
    if (!load()) newGame();

    $('restartBtn').addEventListener('click', () => {
        MB.modal({
            icon: '🔄',
            title: 'Start a new game?',
            text: 'Your current progress will be lost.',
            buttons: [
                { label: 'New game', primary: true, onClick: newGame },
                { label: 'Cancel' }
            ]
        });
    });
})();