

const categoryPages = {
    "Football": "football(4).html",
    "Movies & Series": "movies.html",
    "Music": "music(1).html",
    "Gaming": "gaming(1).html",
    "General Knowledge": "general.html",
    "Dare Zone": "dark.html"
};
function openCategory(category) {
    window.location.href = categoryPages[category];
}

const savedName = localStorage.getItem("playerName") || "SHADOW";
const savedAvatar = localStorage.getItem("selectedAvatar") || "avatar-1.png.jpg";

document.getElementById("topName").textContent = savedName.toUpperCase();
document.getElementById("topAvatar").src = savedAvatar;


function openCategory(category) {
    const page = categoryPages[category];

    if (!page) {
        console.error("Category page not found:", category);
        return;
    }

    window.location.href = page;
}


function logout() {
    const confirmed = confirm("Are you sure you want to logout?");

    if (confirmed) {
        localStorage.removeItem("playerName");
        localStorage.removeItem("selectedAvatar");
        window.location.href = "index.html";
    }
}


function openSettings() {
    alert("Settings page coming soon.");
}
