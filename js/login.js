import { BASE_URL } from './info.js';
import { handleError } from './api.js';

document.querySelector('#frmLogin').addEventListener('submit', async e => {
    e.preventDefault();

    const params = new FormData();
    params.append('email', e.target.txtEmail.value.trim());
    params.append('password', e.target.txtPassword.value.trim());

    try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: params
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();

    if (data.auth_token) {
        sessionStorage.setItem('book_app_user_id', data.user_id);
        sessionStorage.setItem('book_app_user_token', data.auth_token);
        sessionStorage.setItem('book_app_user_is_admin', data.is_admin);

      // Redirect afhængigt af admin-status
        if (data.is_admin === true) {
        window.location.href = 'panel.html';
        } else {
        window.location.href = 'profile.html';
        }

    } else {
        throw new Error(data.error || 'Login failed');
    }

    } catch (err) {
    handleError(err);
    }
});

