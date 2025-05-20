import { BASE_URL } from './info.js';
import { handleError } from './api.js';

document.querySelector('#frmLogin').addEventListener('submit', async e => {
    e.preventDefault();

    // Opret et objekt til at samle input-værdier
    const params = new FormData();
    params.append('email', e.target.txtEmail.value.trim());
    params.append('password', e.target.txtPassword.value.trim());

    // Send en POST-request til login-endpointet
    try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: params
    });
    
    // Parse JSON før du bruger det
    const data = await response.json(); 
    console.log('Login response:', data);

    if (!response.ok) throw new Error(data.error || 'Login failed');

    // Fortolk is_admin korrekt uanset type
    const isAdmin = data.is_admin === 1 || data.is_admin === '1' || data.is_admin === true || data.is_admin === 'true';

    // Gem i sessionStorage
    sessionStorage.setItem('book_app_user_id', data.user_id);
    sessionStorage.setItem('book_app_user_token', data.auth_token);
    sessionStorage.setItem('book_app_user_is_admin', isAdmin ? 'true' : 'false');

    // Redirect
    if (isAdmin) {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'profile.html';
    }

    } catch (err) {
    handleError(err);
    }
});
