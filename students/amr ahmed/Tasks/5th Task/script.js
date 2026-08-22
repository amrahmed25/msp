const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

       
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const destination = prompt(
            "What is your favorite travel destination?"
        );
        
        console.log("User Information:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Favorite Destination:", destination);
        window.location.href = "home.html";
        alert(
            `Welcome ${name}! We hope you enjoy your trip to ${destination}.`
        );
        
    });
}