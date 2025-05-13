// === HENT BRUGERDATA ===
const userId = sessionStorage.getItem('book_app_user_id');
const token = sessionStorage.getItem('book_app_user_token');

// Redirect hvis brugeren ikke er logget ind
if (!userId || !token) {
    window.location.href = 'login.html';
}

fetch(`http://127.0.0.1:5555/users/${userId}`, {
    headers: {
    'X-Session-Token': token
    }
})

.then(res => {
    if (!res.ok) throw new Error('Brugerdata kunne ikke hentes');
    return res.json();
})

.then(data => {
    document.querySelector('#name').textContent = `${data.first_name} ${data.last_name}`;
    document.querySelector('#email').textContent = data.email;
    document.querySelector('#birth').textContent = data.birth_date;
    document.querySelector('#address').textContent = data.address;
    document.querySelector('#phone').textContent = data.phone_number;
    document.querySelector('#member').textContent = data.membership_date;
})

.catch(err => {
    console.error('Fejl ved indlæsning af brugerdata:', err);
    alert('Der opstod en fejl under hentning af din profilinformation.');
});

document.getElementById('loaned_books').onclick = () => {
    document.getElementById('my_books').classList.remove('hidden');
    document.getElementById('user_info').classList.add('hidden');
};
document.getElementById('personal_info').onclick = () => {
    document.getElementById('my_books').classList.add('hidden');
    document.getElementById('user_info').classList.remove('hidden');
};

// === LOGOUT ===
const logoutBtnUser = document.querySelector('#logoutBtnUser');
const logoutBtnAdmin = document.querySelector('#logoutBtnAdmin');

[logoutBtnUser, logoutBtnAdmin].forEach(btn => {
    btn?.addEventListener('click', () => {
    sessionStorage.removeItem('book_app_user_id');
    sessionStorage.removeItem('book_app_user_token');
    sessionStorage.removeItem('book_app_user_is_admin');
    window.location.href = 'login.html';
    });
});
