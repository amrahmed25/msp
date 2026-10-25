(function () {
  const MUSIC_KEY = "music";

  const TRACKS = {
    home: "audio/home.mp3",
    classic: "audio/classic.mp3",
    rush: "audio/rush.mp3",
    timeAttack: "audio/time-attack.mp3",
    darkZone: "audio/dark-zone.mp3"
  };

  let audio = null;
  let currentTrack = "";
  let enabled = localStorage.getItem(MUSIC_KEY) !== "off";

  function getTrackForPage() {
    const file = location.pathname.toLowerCase().split("/").pop();
    const mode = (new URLSearchParams(location.search).get("mode") || "").toLowerCase();

    if (file === "home.html" || file === "") return TRACKS.home;

    if (file === "board.html") {
      if (mode === "classic") return TRACKS.classic;
      if (mode === "rush") return TRACKS.rush;
      if (mode === "time-attack") return TRACKS.timeAttack;
      if (mode === "dark-zone") return TRACKS.darkZone;
      return TRACKS.classic;
    }

    if (file === "rush.html") return TRACKS.rush;
    if (file === "time-attack.html") return TRACKS.timeAttack;
    if (file === "dark-zone.html") return TRACKS.darkZone;

    return TRACKS.home;
  }

  function ensureAudio() {
    if (audio) return audio;

    audio = document.createElement("audio");
    audio.id = "shiftBackgroundMusic";
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.20;
    audio.style.display = "none";
    audio.setAttribute("aria-hidden", "true");
    document.body.appendChild(audio);

    return audio;
  }

  function play() {
    if (!enabled || !document.body) return;

    const track = getTrackForPage();
    const a = ensureAudio();

    if (currentTrack !== track) {
      currentTrack = track;
      a.pause();
      a.src = track;
      a.load();
    }

    const promise = a.play();
    if (promise && promise.catch) {
      promise.catch(function () {
      });
    }
  }

  function stop() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  function setEnabled(value) {
    enabled = !!value;
    localStorage.setItem(MUSIC_KEY, enabled ? "on" : "off");
    if (enabled) play();
    else stop();
  }

  function retryAfterInteraction() {
    if (!enabled) return;
    play();

    ["pointerdown", "keydown", "touchstart"].forEach(function (eventName) {
      document.removeEventListener(eventName, retryAfterInteraction);
    });
  }

  window.ShiftMusic = {
    play: play,
    stop: stop,
    setEnabled: setEnabled,
    isEnabled: function () { return enabled; },
    tracks: TRACKS
  };

  function init() {
    play();
    ["pointerdown", "keydown", "touchstart"].forEach(function (eventName) {
      document.addEventListener(eventName, retryAfterInteraction, { passive: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("pagehide", stop);
})();
