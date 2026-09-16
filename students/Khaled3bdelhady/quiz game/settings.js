
const savedName =
    localStorage.getItem("playerName") || "SHADOW";

const savedAvatar =
    localStorage.getItem("selectedAvatar") ||
    "avatar-1.png.jpg";



const playerName =
    document.getElementById("playerName");

const profileName =
    document.getElementById("profileName");


if (playerName) {
    playerName.textContent =
        savedName.toUpperCase();
}


if (profileName) {
    profileName.textContent =
        savedName.toUpperCase();
}



const profileAvatar =
    document.getElementById("profileAvatar");

const topAvatar =
    document.querySelector(".avatar-wrapper img");


if (profileAvatar) {
    profileAvatar.src = savedAvatar;
}


if (topAvatar) {
    topAvatar.src = savedAvatar;
}



const soundToggle =
    document.getElementById("soundToggle");

const musicToggle =
    document.getElementById("musicToggle");

const notificationToggle =
    document.getElementById("notificationToggle");

const timerSelect =
    document.getElementById("timerSelect");




const savedSound =
    localStorage.getItem("nexusSound");

const savedMusic =
    localStorage.getItem("nexusMusic");

const savedNotifications =
    localStorage.getItem("nexusNotifications");

const savedTimer =
    localStorage.getItem("nexusTimer");


if (savedSound !== null) {

    soundToggle.checked =
        savedSound === "true";
}


if (savedMusic !== null) {

    musicToggle.checked =
        savedMusic === "true";
}


if (savedNotifications !== null) {

    notificationToggle.checked =
        savedNotifications === "true";
}


if (savedTimer !== null) {

    timerSelect.value =
        savedTimer;
}



const saveButton =
    document.getElementById("saveButton");


saveButton.addEventListener(
    "click",
    function () {

        localStorage.setItem(
            "nexusSound",
            soundToggle.checked
        );

        localStorage.setItem(
            "nexusMusic",
            musicToggle.checked
        );

        localStorage.setItem(
            "nexusNotifications",
            notificationToggle.checked
        );

        localStorage.setItem(
            "nexusTimer",
            timerSelect.value
        );


        saveButton.innerHTML =
            'SAVED <i class="bi bi-check2"></i>';


        setTimeout(function () {

            saveButton.innerHTML =
                'SAVE CHANGES <i class="bi bi-check2"></i>';

        }, 1800);

    }
);




const resetButton =
    document.getElementById("resetButton");


resetButton.addEventListener(
    "click",
    function () {

        soundToggle.checked = true;

        musicToggle.checked = false;

        notificationToggle.checked = true;

        timerSelect.value = "30";


        localStorage.setItem(
            "nexusSound",
            true
        );

        localStorage.setItem(
            "nexusMusic",
            false
        );

        localStorage.setItem(
            "nexusNotifications",
            true
        );

        localStorage.setItem(
            "nexusTimer",
            30
        );

    }
);




const logoutButton =
    document.getElementById("logoutButton");


logoutButton.addEventListener(
    "click",
    function () {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );

        if (confirmLogout) {

            window.location.href =
                "index.html";
        }

    }
);