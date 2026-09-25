

(function () {

    const SOUND_KEY = "sound";

    let audioCtx = null;
    let masterGain = null;
    let compressor = null;

    

    function isEnabled() {
        try {
            return localStorage.getItem(SOUND_KEY) !== "off";
        } catch (e) {
            return true;
        }
    }

    function setEnabled(value) {
        try {
            localStorage.setItem(SOUND_KEY, value ? "on" : "off");
        } catch (e) {}

        syncControls();
        return value;
    }

   

    function getAudioContext() {

        if (!audioCtx) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                return null;
            }

            audioCtx = new AudioContextClass();

            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0.95;

            
            compressor = audioCtx.createDynamicsCompressor();

            compressor.threshold.value = -18;
            compressor.knee.value = 10;
            compressor.ratio.value = 8;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.12;

            masterGain
                .connect(compressor)
                .connect(audioCtx.destination);
        }

        if (audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => {});
        }

        return audioCtx;
    }

    

    function playClick() {

        if (!isEnabled()) return;

        try {

            const ctx = getAudioContext();

            if (!ctx || !masterGain) return;

            const now = ctx.currentTime;

           

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "square";

            osc.frequency.setValueAtTime(780, now);
            osc.frequency.exponentialRampToValueAtTime(
                250,
                now + 0.075
            );

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(
                0.13,
                now + 0.004
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.095
            );

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.11);


           

            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();

            bass.type = "triangle";

            bass.frequency.setValueAtTime(180, now);
            bass.frequency.exponentialRampToValueAtTime(
                80,
                now + 0.09
            );

            bassGain.gain.setValueAtTime(0.0001, now);

            bassGain.gain.exponentialRampToValueAtTime(
                0.09,
                now + 0.005
            );

            bassGain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.10
            );

            bass.connect(bassGain);
            bassGain.connect(masterGain);

            bass.start(now);
            bass.stop(now + 0.115);


          

            const snap = ctx.createOscillator();
            const snapGain = ctx.createGain();

            snap.type = "sine";

            snap.frequency.setValueAtTime(1450, now);

            snapGain.gain.setValueAtTime(0.0001, now);

            snapGain.gain.exponentialRampToValueAtTime(
                0.055,
                now + 0.002
            );

            snapGain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.035
            );

            snap.connect(snapGain);
            snapGain.connect(masterGain);

            snap.start(now);
            snap.stop(now + 0.045);

        } catch (e) {
        }
    }


    
    function playSuccess() {

        if (!isEnabled()) return;

        try {

            const ctx = getAudioContext();

            if (!ctx || !masterGain) return;

            const now = ctx.currentTime;

            playTone(ctx, masterGain, 600, 0.09, 0.10);
            playTone(ctx, masterGain, 900, 0.14, 0.11, 0.07);

        } catch (e) {}
    }


    function playError() {

        if (!isEnabled()) return;

        try {

            const ctx = getAudioContext();

            if (!ctx || !masterGain) return;

            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sawtooth";

            osc.frequency.setValueAtTime(240, now);
            osc.frequency.exponentialRampToValueAtTime(
                120,
                now + 0.18
            );

            gain.gain.setValueAtTime(0.0001, now);

            gain.gain.exponentialRampToValueAtTime(
                0.11,
                now + 0.01
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.18
            );

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.2);

        } catch (e) {}
    }


    function playTone(ctx, destination, frequency, duration, volume, delay = 0) {

        const now = ctx.currentTime + delay;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";

        osc.frequency.setValueAtTime(
            frequency,
            now
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            volume,
            now + 0.008
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        osc.connect(gain);
        gain.connect(destination);

        osc.start(now);
        osc.stop(now + duration + 0.02);
    }


   

    function play(type = "click") {

        if (!isEnabled()) return;

        if (type === "success") {
            playSuccess();
            return;
        }

        if (type === "error") {
            playError();
            return;
        }

        playClick();
    }


    function toggle() {

        const next = !isEnabled();

        setEnabled(next);

        if (next) {
            setTimeout(() => playSuccess(), 20);
        }

        return next;
    }


   

    function syncControls() {

        const enabled = isEnabled();

        document
            .querySelectorAll(
                ".sound-btn, " +
                ".sound-control, " +
                ".sound-button, " +
                "#soundBtn, " +
                "#soundButton"
            )
            .forEach(function (button) {

                button.classList.toggle(
                    "sound-off",
                    !enabled
                );

                button.setAttribute(
                    "aria-label",
                    enabled
                        ? "Turn sound off"
                        : "Turn sound on"
                );

                button.setAttribute(
                    "title",
                    enabled
                        ? "Sound on"
                        : "Sound off"
                );
            });
    }


    window.ShiftSound = {
        isEnabled,
        setEnabled,
        play,
        toggle,
        sync: syncControls
    };


   

    let lastPointerSound = 0;

    function shouldPlayFor(element) {

        if (!element) return false;

        if (
            element.disabled ||
            element.getAttribute("aria-disabled") === "true"
        ) {
            return false;
        }

        if (
            element.matches(
                ".sound-btn, " +
                ".sound-control, " +
                ".sound-button, " +
                "#soundBtn, " +
                "#soundButton"
            )
        ) {
            return false;
        }

        if (
            element.dataset &&
            element.dataset.noSound === "true"
        ) {
            return false;
        }

        return true;
    }


    

    document.addEventListener(
        "pointerdown",
        function (event) {

            const target = event.target.closest(
                "button, a, [role='button'], " +
                "input[type='checkbox'], " +
                "input[type='radio'], " +
                "label, .mode-card, .fb-star, .fb-chip"
            );

            if (!shouldPlayFor(target)) return;

            lastPointerSound = performance.now();

            play("click");

        },
        true
    );


    

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }

            const target = event.target.closest(
                "button, a, [role='button'], " +
                "input[type='checkbox'], " +
                "input[type='radio'], label"
            );

            if (!shouldPlayFor(target)) return;

            if (
                performance.now() - lastPointerSound < 120
            ) {
                return;
            }

            play("click");

        },
        true
    );


    document.addEventListener(
        "click",
        function (event) {

            const link = event.target.closest("a");

            if (!link) return;

            if (!shouldPlayFor(link)) return;

            const href = link.getAttribute("href");

            if (!href) return;

            if (href.startsWith("#")) return;

            if (href.startsWith("javascript:")) return;

            if (
                link.target === "_blank" ||
                link.hasAttribute("download")
            ) {
                return;
            }

            if (event.defaultPrevented) return;

            event.preventDefault();

            const destination = link.href;

            setTimeout(function () {
                window.location.href = destination;
            }, 140);

        },
        true
    );


   

    document.addEventListener(
        "change",
        function (event) {

            const input = event.target;

            if (!input) return;

            if (
                input.tagName !== "INPUT" ||
                (
                    input.type !== "checkbox" &&
                    input.type !== "radio"
                )
            ) {
                return;
            }

            if (input.id === "soundToggle") {
                return;
            }

            if (
                performance.now() - lastPointerSound < 150
            ) {
                return;
            }

            play("click");

        },
        true
    );


   
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            syncControls,
            { once: true }
        );

    } else {

        syncControls();

    }

})();