(function () {
    'use strict';

    const KEY = {
        users: 'mb_users',
        current: 'mb_current',
        sound: 'mb_sound',
        pos: 'mb_sound_pos'
    };

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const read = (store, k, d = null) => {
        try { const v = store.getItem(k); return v === null ? d : JSON.parse(v); }
        catch (e) { return d; }
    };
    const write = (store, k, v) => { try { store.setItem(k, JSON.stringify(v)); } catch (e) { } };

    const getUsers = () => read(localStorage, KEY.users, {});
    const saveUsers = (u) => write(localStorage, KEY.users, u);

    function getCurrentUser() {
        const email = read(sessionStorage, KEY.current) || read(localStorage, KEY.current);
        if (!email) return null;
        const u = getUsers()[email];
        return u ? { email: email, username: u.username } : null;
    }

    function setCurrentUser(email, remember) {
        sessionStorage.removeItem(KEY.current);
        localStorage.removeItem(KEY.current);
        write(remember ? localStorage : sessionStorage, KEY.current, email);
    }

    function logout() {
        sessionStorage.removeItem(KEY.current);
        localStorage.removeItem(KEY.current);
    }

    async function hash(text) {
        const s = 'mergebite:' + text;
        try {
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            return 'b64:' + btoa(unescape(encodeURIComponent(s)));
        }
    }

    function toast(message, type = 'info', ms = 3400) {
        let wrap = $('.mb-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'mb-toast-wrap';
            wrap.setAttribute('role', 'status');
            wrap.setAttribute('aria-live', 'polite');
            document.body.appendChild(wrap);
        }
        const icons = { success: 'bi-check-circle-fill', error: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
        const t = document.createElement('div');
        t.className = 'mb-toast ' + type;
        const i = document.createElement('i');
        i.className = 'bi ' + (icons[type] || icons.info);
        const s = document.createElement('span');
        s.textContent = message;
        t.append(i, s);
        wrap.appendChild(t);
        requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => t.remove(), 320);
        }, ms);
    }

    function modal(opts) {
        const o = Object.assign({ title: '', text: '', icon: '', image: '', buttons: [], dismissible: true }, opts);
        const overlay = document.createElement('div');
        overlay.className = 'mb-modal-overlay';
        const box = document.createElement('div');
        box.className = 'mb-modal';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');

        if (o.image) {
            const img = document.createElement('img');
            img.className = 'mb-modal-img';
            img.src = o.image;
            img.alt = '';
            box.appendChild(img);
        } else if (o.icon) {
            const ic = document.createElement('div');
            ic.className = 'mb-modal-icon';
            ic.textContent = o.icon;
            box.appendChild(ic);
        }
        const h = document.createElement('h2');
        h.textContent = o.title;
        box.appendChild(h);
        if (o.text) {
            const p = document.createElement('p');
            p.textContent = o.text;
            box.appendChild(p);
        }

        const close = () => {
            overlay.classList.remove('show');
            document.removeEventListener('keydown', onKey);
            setTimeout(() => overlay.remove(), 260);
        };
        const onKey = (e) => { if (e.key === 'Escape' && o.dismissible) close(); };

        if (o.buttons.length) {
            const row = document.createElement('div');
            row.className = 'mb-modal-actions';
            o.buttons.forEach((b) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'mb-btn' + (b.primary ? ' primary' : '');
                btn.textContent = b.label;
                btn.addEventListener('click', () => { close(); if (b.onClick) b.onClick(); });
                row.appendChild(btn);
            });
            box.appendChild(row);
        }

        overlay.appendChild(box);
        if (o.dismissible) overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('show')));
        const first = $('.mb-btn', box);
        if (first) first.focus();
        return { close: close };
    }

    const audio = new Audio('audio/background_sound.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = 'auto';

    let soundOn = read(localStorage, KEY.sound, true) !== false;

    const savedPos = parseFloat(sessionStorage.getItem(KEY.pos)) || 0;
    audio.addEventListener('loadedmetadata', () => {
        if (savedPos > 0 && savedPos < audio.duration) audio.currentTime = savedPos;
    }, { once: true });

    const savePos = () => { try { sessionStorage.setItem(KEY.pos, String(audio.currentTime)); } catch (e) { } };
    window.addEventListener('pagehide', savePos);
    setInterval(() => { if (!audio.paused) savePos(); }, 2000);

    function tryPlay() {
        if (!soundOn) return;
        const p = audio.play();
        if (p && p.catch) p.catch(() => { });
    }

    function updateSoundButtons() {
        $$('#soundBtn').forEach((b) => {
            b.textContent = soundOn ? '🔊' : '🔇';
            b.classList.toggle('muted', !soundOn);
            const label = soundOn ? 'Mute music' : 'Unmute music';
            b.title = label;
            b.setAttribute('aria-label', label);
            b.setAttribute('aria-pressed', String(!soundOn));
        });
    }

    function toggleSound() {
        soundOn = !soundOn;
        write(localStorage, KEY.sound, soundOn);
        if (soundOn) tryPlay(); else audio.pause();
        updateSoundButtons();
    }

    const unlockEvents = ['pointerdown', 'keydown', 'touchstart'];
    const unlock = () => { if (soundOn && audio.paused) tryPlay(); };
    unlockEvents.forEach(ev => window.addEventListener(ev, unlock, { passive: true }));
    audio.addEventListener('playing', () => unlockEvents.forEach(ev => window.removeEventListener(ev, unlock)));

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) audio.pause(); else tryPlay();
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('#soundBtn')) toggleSound();
    });

    let actx = null;
    function ctx() {
        if (!actx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            actx = new AC();
        }
        if (actx.state === 'suspended') actx.resume();
        return actx;
    }

    function blip(freq, when, len, vol) {
        const c = ctx();
        if (!c) return;
        const t0 = c.currentTime + when;
        const master = c.createGain();
        master.gain.setValueAtTime(0.0001, t0);
        master.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
        master.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
        master.connect(c.destination);

        [[freq, 'sine', 1], [freq * 2, 'triangle', 0.35]].forEach(([f, type, g]) => {
            const o = c.createOscillator();
            const og = c.createGain();
            o.type = type;
            o.frequency.setValueAtTime(f * 0.85, t0);
            o.frequency.exponentialRampToValueAtTime(f, t0 + 0.05);
            og.gain.value = g;
            o.connect(og);
            og.connect(master);
            o.start(t0);
            o.stop(t0 + len + 0.05);
        });
    }

    const PENTA = [0, 2, 4, 7, 9];
    const noteFreq = (i) => 261.63 * Math.pow(2, (PENTA[i % 5] + 12 * Math.floor(i / 5)) / 12);

    const sfx = {
        merge(level, delay) {
            if (!soundOn) return;
            blip(noteFreq(Math.max(0, level - 1) + 2), delay || 0, 0.26, 0.16);
        },
        win() {
            if (!soundOn) return;
            [0, 2, 4, 5, 7].forEach((n, i) => blip(noteFreq(n + 5), i * 0.11, 0.4, 0.16));
        },
        over() {
            if (!soundOn) return;
            [7, 4, 2, 0].forEach((n, i) => blip(noteFreq(n + 2), i * 0.16, 0.35, 0.14));
        }
    };

    function setupNav() {
        const user = getCurrentUser();
        
    const menuBtn = $('#menuBtn');
    const nav = $('.nav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('show');
        });
    }
        const loginLink = $('.login-link');
        const regBtn = $('.register-btn');

        if (user && loginLink && regBtn) {
            loginLink.href = '#';
            loginLink.textContent = '';
            const ic = document.createElement('i');
            ic.className = 'bi bi-person-circle';
            loginLink.append(ic, ' ' + user.username);
            loginLink.addEventListener('click', (e) => { e.preventDefault(); showProfile(); });

            regBtn.href = '#';
            regBtn.textContent = 'Logout';
            regBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
                toast('You have been logged out. See you soon!', 'info');
                setTimeout(() => location.reload(), 900);
            });
        }

        $$('.nav-link').forEach((a) => {
            if (!$('.bi-person-fill', a)) return;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (!getCurrentUser()) {
                    toast('Please log in to see your profile.', 'info');
                    setTimeout(() => { location.href = 'index.html'; }, 1200);
                } else {
                    showProfile();
                }
            });
        });
    }

    function showProfile() {
        const user = getCurrentUser();
        if (!user) return;
        const bestN = read(localStorage, 'mb_best_numbers', 0);
        const bestF = read(localStorage, 'mb_best_fruits', 0);
        modal({
            image: 'images/png.png',
            title: user.username,
            text: user.email + '\n\nBest score in Numbers: ' + bestN + '\nBest score in Fruits & Food: ' + bestF,
            buttons: [{ label: 'Close', primary: true }]
        });
    }

    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function initBackground() {
        if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const calm = !!$('.game-page');
        const k = (innerWidth < 700 ? 0.55 : 1) * (calm ? 0.6 : 1);
        const layer = document.createElement('div');
        layer.className = 'bg-anim';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = '<i class="bg-aurora a1"></i><i class="bg-aurora a2"></i>';

        const floatItem = (type, o) => {
            const dur = o.dur;
            const el = document.createElement('div');
            el.className = 'bg-item bg-' + type + ' ' + (Math.random() < 0.62 ? 'rise' : 'fall');
            el.style.cssText =
                '--s:' + o.size + 'px;--dur:' + dur + 's;--delay:' + (-rnd(0, dur)) + 's;' +
                '--drift:' + rnd(-160, 160) + 'px;--rot:' + rnd(6, 26) + 'deg;--op:' + o.op + ';' +
                '--sway:' + rnd(3.5, 7) + 's;left:' + rnd(-2, 96) + '%;' + (o.vars || '');
            const inner = document.createElement('span');
            inner.className = 'bg-inner';
            if (o.style) inner.style.cssText = o.style;
            if (o.text) inner.textContent = o.text;
            el.appendChild(inner);
            layer.appendChild(el);
        };

        const fruitFiles = ['1-blueberry', '2-blackberry', '3-jar', '4-cake', '5-pie'];
        for (let i = 0; i < Math.round(9 * k); i++) {
            floatItem('fruit', {
                size: rnd(52, 104), dur: rnd(24, 44), op: rnd(0.5, 0.85),
                style: 'background-image:url(images/fruits/' + pick(fruitFiles) + '.png)'
            });
        }

        const cubes = {
            2:   { g: 'linear-gradient(160deg,#7cc0ff,#2f62f5)', glow: 'rgba(70,130,255,.75)' },
            4:   { g: 'linear-gradient(160deg,#ffe36b,#ffab18)', glow: 'rgba(255,190,40,.75)' },
            8:   { g: 'linear-gradient(160deg,#ffa552,#ff6420)', glow: 'rgba(255,120,40,.75)' },
            16:  { g: 'linear-gradient(160deg,#ff6f84,#e5203f)', glow: 'rgba(255,50,90,.75)' },
            32:  { g: 'linear-gradient(160deg,#ff86ec,#d51db3)', glow: 'rgba(255,70,220,.8)' },
            64:  { g: 'linear-gradient(160deg,#c894ff,#7a2ce6)', glow: 'rgba(160,80,255,.8)' },
            128: { g: 'linear-gradient(160deg,#6af2ff,#139bdc)', glow: 'rgba(40,210,255,.8)' },
            256: { g: 'linear-gradient(160deg,#86ffa8,#12b85d)', glow: 'rgba(40,230,120,.8)' }
        };
        const nums = Object.keys(cubes);
        for (let i = 0; i < Math.round(8 * k); i++) {
            const n = pick(nums), c = cubes[n];
            floatItem('cube', {
                size: rnd(34, 64), dur: rnd(20, 38), op: rnd(0.55, 0.9),
                text: n, vars: '--g:' + c.g + ';--glow:' + c.glow + ';'
            });
        }

        for (let i = 0; i < Math.round(12 * k); i++) {
            floatItem('bubble', { size: rnd(10, 46), dur: rnd(14, 30), op: rnd(0.4, 0.8) });
        }

        for (let i = 0; i < Math.round(16 * k); i++) {
            const sp = document.createElement('i');
            sp.className = 'bg-spark';
            sp.style.cssText = '--s:' + rnd(8, 20) + 'px;--dur:' + rnd(2.5, 6) + 's;--delay:' + (-rnd(0, 6)) +
                's;left:' + rnd(0, 98) + '%;top:' + rnd(0, 96) + '%;';
            layer.appendChild(sp);
        }

        document.body.prepend(layer);
    }

    function init() {
        if (!$('#soundBtn')) {
            const b = document.createElement('button');
            b.id = 'soundBtn';
            b.type = 'button';
            b.className = 'sound-floating';
            document.body.appendChild(b);
        }
        updateSoundButtons();
        setupNav();
        initBackground();
        tryPlay();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.MB = {
        toast, modal, hash, sfx,
        getUsers, saveUsers, getCurrentUser, setCurrentUser, logout,
        audio, read, write
    };
})();