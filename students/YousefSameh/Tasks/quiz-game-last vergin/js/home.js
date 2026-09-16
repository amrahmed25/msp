const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

if (!currentUser) {
    window.location.href = "index.html";
} else {
    document.getElementById("welcome-message").textContent = "Welcome, " + currentUser.name + "!";

    const navActions = document.getElementById("nav-actions");
    navActions.innerHTML = `
        <span class="user-greeting">Welcome, ${currentUser.name}</span>
        <a href="#" id="logout-btn" class="register-btn">Logout</a>
    `;

    document.getElementById("logout-btn").addEventListener("click", function(e) {
        e.preventDefault();
        sessionStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
}