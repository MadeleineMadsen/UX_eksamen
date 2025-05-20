
// Tjek om der er admin-adgang
const isAdmin = sessionStorage.getItem('book_app_user_is_admin') === 'true';
if (!isAdmin) {
    alert('You don´t have access to the adminpanel.');
    window.location.href = 'index.html';
}

// Author (localstorage)
const authorForm = document.getElementById('addAuthorForm');
authorForm?.addEventListener('submit', e => {
    e.preventDefault();

    const input = authorForm.querySelector('input[name="first_name"]');
    const name  = input.value.trim();
    if (!name) {
    alert('Add an author');
    return;
    }

  // Hent eksisterende eller opret nyt array
    const storedAuthors = localStorage.getItem('authors');
    const authors       = storedAuthors ? JSON.parse(storedAuthors) : [];

  // Tilføj og gem
    authors.push({ first_name: name });
    localStorage.setItem('authors', JSON.stringify(authors));

    renderAuthors(); 
    authorForm.reset();
    alert('Author saved successfully');
});

// Book (localstorage)
const bookForm = document.getElementById('addBookForm');
bookForm?.addEventListener('submit', e => {
    e.preventDefault();

    const input = bookForm.querySelector('input[name="title"]');
    const title = input.value.trim();
    if (!title) {
    alert('Add a booktitle');
    return;
    }

    // Hent eksisterende eller opret nyt array
    const storedBooks = localStorage.getItem('books');
    const books       = storedBooks ? JSON.parse(storedBooks) : [];

    // Tilføj og gem
    books.push({ title });
    localStorage.setItem('books', JSON.stringify(books));

    renderBooks();
    bookForm.reset();
    alert('Booktitle saved successfully');
});

// Publisher (localstorage)
const publisherForm = document.getElementById('addPublisherForm');
publisherForm?.addEventListener('submit', e => {
    e.preventDefault();

    const input = publisherForm.querySelector('input[name="name"]');
    const name  = input.value.trim();
    if (!name) {
    alert('Add a publisher');
    return;
    }

    // Hent eksisterende eller opret nyt array
    const storedPublishers = localStorage.getItem('publishers');
    const publishers       = storedPublishers ? JSON.parse(storedPublishers) : [];

    // Tilføj og gem
    publishers.push({ name });
    localStorage.setItem('publishers', JSON.stringify(publishers));

    renderPublishers(); 
    publisherForm.reset();
    alert('Publisher saved successfully');
});

// Log ud
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

// Hent brugerdata
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
    if (!res.ok) throw new Error('Userdata could not be fetched');
    return res.json();
})

.then(data => {
    document.querySelector('#name').textContent = `${data.name} ${data.last_name}`;
    document.querySelector('#email').textContent = data.email;
    document.querySelector('#birth').textContent = data.birth_date;
    document.querySelector('#address').textContent = data.address;
    document.querySelector('#phone').textContent = data.phone_number;
    document.querySelector('#member').textContent = data.membership_date;
})

.catch(err => {
    console.error('Error loading user data:', err);
    alert('An error occurred while retrieving your profile information.');
});

// Render-funktioner til at vise gemt localstorage på siden
function renderAuthors() {
    const list  = document.getElementById('authorsList');
    const data  = JSON.parse(localStorage.getItem('authors') || '[]');
    list.innerHTML = data
        .map(a => `<li>${a.first_name}</li>`)
        .join('');
    }

function renderBooks() {
    const list = document.getElementById('booksList');
    const data = JSON.parse(localStorage.getItem('books') || '[]');
    list.innerHTML = data
        .map(b => `<li>${b.title}</li>`)
        .join('');
    }

function renderPublishers() {
    const list = document.getElementById('publishersList');
    const data = JSON.parse(localStorage.getItem('publishers') || '[]');
    list.innerHTML = data
        .map(p => `<li>${p.name}</li>`)
        .join('');
    }

  // Kalder render-funktionerne, når siden indlæses
document.addEventListener('DOMContentLoaded', () => {
    renderAuthors();
    renderBooks();
    renderPublishers();
});


// Fjern / tilføj display none ved klik i den venstre navigation
document.getElementById('add_books').onclick = () => {
    document.getElementById('book_form').classList.remove('hidden');
    document.getElementById('new_books').classList.add('hidden');
    document.getElementById('admin').classList.add('hidden');
};
document.getElementById('added_books').onclick = () => {
    document.getElementById('book_form').classList.add('hidden');
    document.getElementById('new_books').classList.remove('hidden');
    document.getElementById('admin').classList.add('hidden');
};
document.getElementById('personal_info').onclick = () => {
    document.getElementById('book_form').classList.add('hidden');
    document.getElementById('new_books').classList.add('hidden');
    document.getElementById('admin').classList.remove('hidden');
};

