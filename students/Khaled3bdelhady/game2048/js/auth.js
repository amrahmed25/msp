(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const HOME = 'Home.html';

    document.querySelectorAll('.password-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = btn.closest('.input-group').querySelector('input');
            const icon = btn.querySelector('i');
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            icon.className = show ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
    });

    function flag(input) {
        const group = input.closest('.input-group');
        group.animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' },
             { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }],
            { duration: 320 }
        );
        input.focus();
    }

    const loginForm = $('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = $('#loginEmail');
            const passInput = $('#loginPassword');
            const email = emailInput.value.trim().toLowerCase();
            const password = passInput.value;
            const remember = $('.remember-me input').checked;

            const user = MB.getUsers()[email];

            if (!user) {
                MB.toast('You are not registered yet. Please create an account first.', 'error', 4200);
                flag(emailInput);
                return;
            }

            if (user.password !== await MB.hash(password)) {
                MB.toast('Incorrect password. Please try again.', 'error');
                flag(passInput);
                return;
            }

            MB.setCurrentUser(email, remember);
            MB.toast('Welcome back, ' + user.username + '!', 'success', 2000);
            loginForm.querySelector('button[type="submit"]').disabled = true;
            setTimeout(() => { location.href = HOME; }, 1400);
        });

        const forgot = $('.forgot-password');
        if (forgot) {
            forgot.addEventListener('click', (e) => {
                e.preventDefault();
                MB.toast('Password recovery is not available yet.', 'info');
            });
        }
    }

    const registerForm = $('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = $('#username');
            const emailInput = $('#regEmail');
            const passInput = $('#regPassword');
            const confirmInput = $('#confirmPassword');

            const username = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passInput.value;

            if (username.length < 3) {
                MB.toast('Username must be at least 3 characters.', 'error');
                flag(nameInput);
                return;
            }
            if (password.length < 6) {
                MB.toast('Password must be at least 6 characters.', 'error');
                flag(passInput);
                return;
            }
            if (password !== confirmInput.value) {
                MB.toast('Passwords do not match.', 'error');
                flag(confirmInput);
                return;
            }

            const users = MB.getUsers();
            if (users[email]) {
                MB.toast('This email is already registered. Please log in instead.', 'error', 4200);
                flag(emailInput);
                return;
            }

            users[email] = { username: username, password: await MB.hash(password), createdAt: Date.now() };
            MB.saveUsers(users);
            MB.setCurrentUser(email, true);

            registerForm.querySelector('button[type="submit"]').disabled = true;
            MB.modal({
                image: 'images/png.png',
                title: 'Welcome to MergeBite 2048, ' + username + '!',
                text: 'Your account is ready.\nTaking you to the home page…',
                dismissible: false
            });
            setTimeout(() => { location.href = HOME; }, 2600);
        });
    }
})();
