import { baseUserUrl } from './env.js';
import { handleAPIError, handleFetchCatchError } from './common.js';
import { handleCloseDialogButton } from './common.js';

document.querySelector('#frmSignup').addEventListener('submit', e => {
e.preventDefault();

    const pwd  = e.target.txtPassword.value.trim();
    const rpt  = e.target.txtRepeatPassword.value.trim();
    if (pwd !== rpt) {
    document.querySelector('#msgPasswordError').showModal();
    return;
}

    const firstName = e.target.txtFirstname.value.trim();
    const lastName  = e.target.txtLastname.value.trim();
    const email     = e.target.txtEmail.value.trim();

    const params = new URLSearchParams();
    params.append('email',       email);
    params.append('first_name',  firstName);
    params.append('last_name',   lastName);
    params.append('password',    pwd);

    fetch(`${baseUserUrl}/users`, {
    method: 'POST',
    body: params
})
    .then(handleAPIError)
    .then(data => {
        if (data.user_id) {
        window.location.href = 'login.html';
        } else {
        throw new Error(data.error || 'Unknown error');
        }
    })
    .catch(handleFetchCatchError);
});

// Luk-password-dialog
document.querySelector('#msgPasswordError .close')
        .addEventListener('click', handleCloseDialogButton);
