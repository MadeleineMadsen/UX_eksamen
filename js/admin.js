import { BASE_URL } from './info.js';
import { handleError } from './api.js';

// Tjek admin-adgang
const isAdmin = sessionStorage.getItem('book_app_user_is_admin') === 'true';
if (!isAdmin) {
    alert('Du har ikke adgang til adminpanelet.');
    window.location.href = 'index.html';
}

// === FORFATTER ===
const authorForm = document.getElementById('addAuthorForm');
authorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = authorForm.name.value.trim();

    try {
    const response = await fetch(`${BASE_URL}/authors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({ name }),
    });

    if (response.ok) {
        alert('Forfatter tilføjet!');
        authorForm.reset();
    
    } else {
        handleError(response, 'Kunne ikke tilføje forfatter.');
    }

    } catch (err) {
    console.error(err);
    alert('Netværksfejl ved tilføjelse af forfatter.');
    }
});

// === BOG ===
const bookForm = document.getElementById('addBookForm');
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = bookForm.title.value.trim();

    try {
    const response = await fetch(`${BASE_URL}/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({ title }),
    });

    if (response.ok) {
        alert('Bog tilføjet!');
        bookForm.reset();

    } else {
        handleError(response, 'Kunne ikke tilføje bog.');
    }

    } catch (err) {
    console.error(err);
    alert('Netværksfejl ved tilføjelse af bog.');
    }
});

// === FORLAG ===
const publisherForm = document.getElementById('addPublisherForm');
publisherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = publisherForm.name.value.trim();

    try {
    const response = await fetch(`${BASE_URL}/publishers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ name }),
    });

    if (response.ok) {
        alert('Forlag tilføjet!');
        publisherForm.reset();
    
    } else {
        handleError(response, 'Kunne ikke tilføje forlag.');
    }
    
} catch (err) {
    console.error(err);
    alert('Netværksfejl ved tilføjelse af forlag.');
    }
});

// === LOG UD ===
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

document.getElementById('add_books').onclick = () => {
    document.getElementById('book_form').classList.remove('hidden');
    document.getElementById('panel').classList.add('hidden');
};
document.getElementById('personal_info').onclick = () => {
    document.getElementById('book_form').classList.add('hidden');
    document.getElementById('panel').classList.remove('hidden');
};
