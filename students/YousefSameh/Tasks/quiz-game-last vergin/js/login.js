document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    let users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
        user => user.email === email && user.password === password
    );

    if (!foundUser) {
        alert("Incorrect email or password!");
        return;
    }
    sessionStorage.setItem("currentUser", JSON.stringify(foundUser));


    window.location.href = "home.html";
});