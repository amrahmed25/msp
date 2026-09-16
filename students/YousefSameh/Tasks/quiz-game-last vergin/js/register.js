document.getElementById("register-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
        alert("An account with this email already exists!");
        return;
    }

    users.push({ name: name, email: email, password: password });


    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created successfully!");
    window.location.href = "index.html";
});