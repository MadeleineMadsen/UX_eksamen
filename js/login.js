import { BASE_URL } from './info.js';
import { handleError } from './common.js';

// ─────────────── Login ───────────────

// Hjælpefunktion til at tjekke e-mail-format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

document.querySelector('#frmLogin').addEventListener('submit', async e => {
    e.preventDefault();

    const form = e.target;
    const email    = form.txtEmail.value.trim();
    const password = form.txtPassword.value.trim();

    // 1) HTML-check (Constraint API)
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // 2) Egen e-mail-check
    if (!validateEmail(email)) {
        return handleError(new Error('Wrong email address.'));
    }

    // 3) Adgangskode-længde
    if (password.length < 8) {
        return handleError(new Error('Wrong password'));
    }

    // Hvis alt er ok, fortsæt med at bygge FormData og fetch(...)
    const params = new FormData();
    params.append('email', email);
    params.append('password', password);

    try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: params
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');

    const isAdmin = data.is_admin === 1
        || data.is_admin === '1'
        || data.is_admin === true
        || data.is_admin === 'true';

    sessionStorage.setItem('book_app_user_id',    data.user_id);
    sessionStorage.setItem('book_app_user_token', data.auth_token);
    sessionStorage.setItem(
        'book_app_user_is_admin',
        isAdmin ? 'true' : 'false'
    );

        window.location.href = isAdmin ? 'admin.html' : 'profile.html';
    } catch (err) {
        handleError(err);
    }
});
