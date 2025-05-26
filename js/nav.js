const userId = sessionStorage.getItem('book_app_user_id');
const isAdmin = sessionStorage.getItem('book_app_user_is_admin') === 'true';

const guestNav = document.getElementById('nav_guest');
const userNav = document.getElementById('nav_user');
const adminNav = document.getElementById('nav_admin');

if (guestNav) guestNav.classList.add('hidden');
if (userNav) userNav.classList.add('hidden');
if (adminNav) adminNav.classList.add('hidden');

if (userId && isAdmin && adminNav) {
    adminNav.classList.remove('hidden');
} else if (userId && userNav) {
    userNav.classList.remove('hidden');
} else if (guestNav) {
    guestNav.classList.remove('hidden');
}

document.getElementById('logout_user')?.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
});

document.getElementById('logout_admin')?.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
});


