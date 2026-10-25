let sound = localStorage.getItem("sound") !== "off";
let music = localStorage.getItem("music") !== "off";

let soundToggle = document.getElementById("soundToggle");
let musicToggle = document.getElementById("musicToggle");
let resetScore = document.getElementById("resetScore");
let status = document.getElementById("status");

soundToggle.checked = sound;
musicToggle.checked = music;

soundToggle.addEventListener("change", function () {
    localStorage.setItem("sound", soundToggle.checked ? "on" : "off");
    showStatus("Sound setting saved");
});

musicToggle.addEventListener("change", function () {
    localStorage.setItem("music", musicToggle.checked ? "on" : "off");
    if (window.ShiftMusic) window.ShiftMusic.setEnabled(musicToggle.checked);
    showStatus("Music setting saved");
});



resetScore.addEventListener("click", function () {
    localStorage.removeItem("shift2048_best");
    localStorage.removeItem("shift2048_bestTile");
    localStorage.removeItem("shift2048_gamesPlayed");
    localStorage.removeItem("shift2048_winStreak");
    localStorage.removeItem("shift2048_bestWinStreak");
    localStorage.removeItem("shift2048_history");

    showStatus("All scores have been reset");
});

function showStatus(message) {
    status.innerText = message;

    setTimeout(function () {
        status.innerText = "";
    }, 1800);
}

let themeToggle = document.getElementById("themeToggle");
let themeStatus = document.getElementById("themeStatus");
let savedTheme = localStorage.getItem("shiftTheme") || "dark";

function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);

    if (themeStatus) {
        themeStatus.innerText = theme === "light" ? "LIGHT MODE" : "DARK MODE";
    }

    if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
        themeToggle.setAttribute(
            "aria-label",
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
        );
    }
}

applyTheme(savedTheme);

themeToggle.addEventListener("click", function () {
    let currentTheme = document.body.getAttribute("data-theme") || "dark";
    let nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("shiftTheme", nextTheme);
    applyTheme(nextTheme);
    showStatus(nextTheme === "light" ? "Light mode enabled" : "Dark mode enabled");
});

const settingsSoundBtn = document.querySelector(".sound-btn");
if (settingsSoundBtn) {
    function syncSettingsSoundIcon() {
        const isOn = localStorage.getItem("sound") !== "off";
        settingsSoundBtn.classList.toggle("sound-off", !isOn);
        settingsSoundBtn.setAttribute("aria-label", isOn ? "Turn sound off" : "Turn sound on");
        settingsSoundBtn.title = isOn ? "Sound on" : "Sound off";
    }

    syncSettingsSoundIcon();

    settingsSoundBtn.addEventListener("click", function () {
        const isOn = localStorage.getItem("sound") !== "off";
        localStorage.setItem("sound", isOn ? "off" : "on");
        syncSettingsSoundIcon();
    });
}
