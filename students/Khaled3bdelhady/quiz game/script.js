const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const loginPage =
    document.getElementById("loginPage");

const registerPage =
    document.getElementById("registerPage");

const goLogin =
    document.getElementById("goLogin");

const goRegister =
    document.getElementById("goRegister");

const avatars =
    document.querySelectorAll(".avatar");

const avatarName =
    document.getElementById("avatarName");

const registerName =
    document.getElementById("registerName");

const loginName =
    document.getElementById("loginName");

const registerButton =
    document.getElementById("registerButton");

const loginButton =
    document.getElementById("loginButton");


// ===============================
// LOGIN / REGISTER TABS
// ===============================

function showLogin() {
    registerPage.classList.add("hidden");
    loginPage.classList.remove("hidden");

    registerTab.classList.remove("active");
    loginTab.classList.add("active");
}

function showRegister() {
    loginPage.classList.add("hidden");
    registerPage.classList.remove("hidden");

    loginTab.classList.remove("active");
    registerTab.classList.add("active");
}

loginTab.addEventListener("click", showLogin);
registerTab.addEventListener("click", showRegister);

goLogin.addEventListener("click", showLogin);
goRegister.addEventListener("click", showRegister);


// ===============================
// AVATAR SELECTION
// ===============================

avatars.forEach(function (avatar) {

    avatar.addEventListener("click", function () {

        // Remove active from all avatars
        avatars.forEach(function (item) {
            item.classList.remove("active");
        });

        // Add active to selected avatar
        avatar.classList.add("active");

        // Change avatar name
        const name =
            avatar.getAttribute("data-name");

        avatarName.textContent =
            name.toUpperCase();
    });

});


// ===============================
// REGISTER
// ===============================

registerButton.addEventListener(
    "click",
    function () {

        const name =
            registerName.value.trim();

        // Check name
        if (!name) {

            registerName.focus();

            registerName.style.borderColor =
                "#ff4d6d";

            return;
        }

        registerName.style.borderColor =
            "rgba(75,98,145,.65)";


        // ===============================
        // GET SELECTED AVATAR
        // ===============================

        const selectedAvatar =
            document.querySelector(".avatar.active");

        let avatarSrc =
            "avatar-1.png.jpg";


        if (selectedAvatar) {

            const avatarImage =
                selectedAvatar.querySelector("img");

            if (avatarImage) {

                const src =
                    avatarImage.getAttribute("src");

                if (src) {
                    avatarSrc = src;
                }
            }
        }


        // ===============================
        // SAVE PLAYER DATA
        // ===============================

        localStorage.setItem(
            "selectedAvatar",
            avatarSrc
        );

        localStorage.setItem(
            "playerName",
            name
        );


        alert(
            "Welcome to NEXUS, " + name + "!"
        );


        // ===============================
        // GO TO HOME
        // ===============================

        window.location.href =
            "home.html";
    }
);


// ===============================
// LOGIN
// ===============================

loginButton.addEventListener(
    "click",
    function () {

        const name =
            loginName.value.trim();


        // Check name
        if (!name) {

            loginName.focus();

            loginName.style.borderColor =
                "#ff4d6d";

            return;
        }

        loginName.style.borderColor =
            "rgba(75,98,145,.65)";


        // ===============================
        // GET SAVED AVATAR
        // ===============================

        const savedAvatar =
            localStorage.getItem(
                "selectedAvatar"
            ) || "avatar-1.png.jpg";


        // ===============================
        // SAVE CURRENT NAME
        // ===============================

        localStorage.setItem(
            "playerName",
            name
        );


        // Keep the saved avatar
        localStorage.setItem(
            "selectedAvatar",
            savedAvatar
        );


        alert(
            "Welcome back, " + name + "!"
        );


        // ===============================
        // GO TO HOME
        // ===============================

        window.location.href =
            "home.html";
    }
);