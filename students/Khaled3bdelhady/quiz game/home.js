

function openGame(category) {

    window.location.href =
        `quiz.html?category=${category}`;

}





function logout() {

    const confirmLogout =
        confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        localStorage.removeItem("selectedAvatar");
        localStorage.removeItem("playerName");

        window.location.href = "index.html";

    }

}






document.addEventListener("DOMContentLoaded", function () {

    const savedAvatar =
        localStorage.getItem("selectedAvatar") || "1";

    const savedName =
        localStorage.getItem("playerName") || "SHADOW";


   

    const playerNameElement =
        document.querySelector(".player-name");

    if (playerNameElement) {

        playerNameElement.textContent =
            savedName.toUpperCase();

    }


   

    const welcomeName =
        document.querySelector(".hero h1");

    if (welcomeName) {

        welcomeName.textContent =
            savedName.toUpperCase();

    }

});

const savedAvatar =
    localStorage.getItem("selectedAvatar")
    || "avatar-1.png.jpg";

const avatarImage =
    document.querySelector(".avatar-wrapper img");

if (avatarImage) {
    avatarImage.src = savedAvatar;
}


const savedName =
    localStorage.getItem("playerName")
    || "SHADOW";

const playerName =
    document.querySelector(".player-name");

if (playerName) {
    playerName.textContent =
        savedName.toUpperCase();
}

function openGame(category) {

    const pages = {
        Football: "football.html",
        Gaming: "gaming.html",
        Music: "music.html",
        "Movies & Series": "movies.html",
        "General Knowledge": "general.html",
        "Dare Zone": "dark.html"
    };

    if (pages[category]) {
        window.location.href = pages[category];
    }
}