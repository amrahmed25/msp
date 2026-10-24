(function () {
    "use strict";

    const USERS_KEY = "tabibakDemoUsers";
    const LOGIN_KEY = "tabibakLoggedIn";
    const CURRENT_USER_KEY = "tabibakCurrentUser";

    function showMessage(id, text, success = false) {
        const element = document.getElementById(id);

        if (!element) return;

        element.className =
            `mt-5 p-4 rounded-xl text-center ${
                success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
            }`;

        element.textContent = text;
    }

    function getUsers() {
        try {
            const users = JSON.parse(
                localStorage.getItem(USERS_KEY) || "[]"
            );

            return Array.isArray(users) ? users : [];
        } catch (error) {
            return [];
        }
    }

    function normalizeEmail(email) {
        return email.trim().toLowerCase();
    }

    async function hashPassword(password) {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error(
                "SECURE_CRYPTO_UNAVAILABLE"
            );
        }

        const encodedPassword = new TextEncoder().encode(password);

        const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            encodedPassword
        );

        return Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document
                .getElementById("register-name")
                .value.trim();

            const email = normalizeEmail(
                document.getElementById("register-email").value
            );

            const phone = document
                .getElementById("register-phone")
                .value.trim();

            const password = document
                .getElementById("register-password")
                .value;

            if (!name || !email || !phone || !password) {
                showMessage(
                    "register-message",
                    "من فضلك أكمل جميع الحقول المطلوبة."
                );

                return;
            }

            if (password.length < 6) {
                showMessage(
                    "register-message",
                    "كلمة المرور يجب ألا تقل عن 6 أحرف."
                );

                return;
            }

            const users = getUsers();

            const existingUser = users.find(
                user => user.email === email
            );

            if (existingUser) {
                showMessage(
                    "register-message",
                    "هذا البريد الإلكتروني مسجل بالفعل. انتقل إلى تسجيل الدخول."
                );

                return;
            }

            try {
                const passwordHash = await hashPassword(password);

                const latestUsers = getUsers();

                if (
                    latestUsers.some(user => user.email === email)
                ) {
                    showMessage(
                        "register-message",
                        "هذا البريد الإلكتروني مسجل بالفعل. انتقل إلى تسجيل الدخول."
                    );

                    return;
                }

                const newUser = {
                    id: Date.now().toString(),
                    name: name,
                    email: email,
                    phone: phone,
                    passwordHash: passwordHash
                };

                latestUsers.push(newUser);

                localStorage.setItem(
                    USERS_KEY,
                    JSON.stringify(latestUsers)
                );

                showMessage(
                    "register-message",
                    "تم إنشاء الحساب  بنجاح! انتقل الآن إلى تسجيل الدخول.",
                    true
                );

                registerForm.reset();

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1500);

            } catch (error) {
                showMessage(
                    "register-message",
                    "تعذر إنشاء الحساب. شغّل الموقع باستخدام Live Server وحاول مرة أخرى."
                );
            }
        });
    }

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        const params = new URLSearchParams(window.location.search);

        if (params.get("required") === "1") {
            showMessage(
                "login-message",
                "يجب تسجيل الدخول أولًا حتى تتمكن من حجز موعد."
            );
        }

        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = normalizeEmail(
                document.getElementById("login-email").value
            );

            const password = document
                .getElementById("login-password")
                .value;

            if (!email || !password) {
                showMessage(
                    "login-message",
                    "من فضلك أدخل البريد الإلكتروني وكلمة المرور."
                );

                return;
            }

            const users = getUsers();

            const user = users.find(
                account => account.email === email
            );

            if (!user) {
                showMessage(
                    "login-message",
                    "لا يوجد حساب مسجل بهذا البريد الإلكتروني. أنشئ حسابًا جديدًا أولًا."
                );

                return;
            }

            try {
                const passwordHash = await hashPassword(password);

                if (passwordHash !== user.passwordHash) {
                    showMessage(
                        "login-message",
                        "كلمة المرور غير صحيحة. حاول مرة أخرى."
                    );

                    return;
                }

                sessionStorage.setItem(LOGIN_KEY, "true");

                sessionStorage.setItem(
                    CURRENT_USER_KEY,
                    user.email
                );

                showMessage(
                    "login-message",
                    "تم تسجيل الدخول بنجاح! جاري الانتقال إلى الصفحة الرئيسية...",
                    true
                );

                setTimeout(function () {
                    window.location.href = "../index.html";
                }, 800);

            } catch (error) {
                showMessage(
                    "login-message",
                    "تعذر التحقق من بيانات الدخول. شغّل الموقع باستخدام Live Server وحاول مرة أخرى."
                );
            }
        });
    }

})();
