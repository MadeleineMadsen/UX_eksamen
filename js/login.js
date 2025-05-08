import { baseUserUrl } from './info.js';
import { handleAPIError, handleFetchCatchError, handleCloseDialogButton, loadFavourites } from './common.js';

document.querySelector('#frmLogin').addEventListener('submit', e => {
e.preventDefault();

    const params = new FormData();
    params.append('email',    e.target.txtEmail.value.trim());
    params.append('password', e.target.txtPassword.value.trim());

    fetch(`${baseUserUrl}/auth/login`, {
    method: 'POST',
    body: params
})
    .then(handleAPIError)
    .then(data => {
        if (data.user_id) {
        sessionStorage.setItem('book_app_user_id',    data.user_id);
        sessionStorage.setItem('book_app_user_token', data.token);
        return loadFavourites(data.user_id);
    }
    throw new Error(data.error || 'Login failed');
    })
    .then(() => window.location.href = 'index.html')
    .catch(handleFetchCatchError);
});
