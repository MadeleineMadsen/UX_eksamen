// Tjek om der er admin-adgang
import { BASE_URL } from './info.js';
import { loggedUserID, tokenHeader } from './common.js';

const userId = loggedUserID();
const token = sessionStorage.getItem('book_app_user_token');
const isAdmin = sessionStorage.getItem('book_app_user_is_admin') === 'true';

if (!userId || !token || !isAdmin) {
    alert('You don’t have access to the adminpanel.');
    window.location.href = 'index.html';
}

// Tilføj bogtitel (med automatisk oprettelse af forfatter og udgiver hvis de ikke findes)
document.getElementById('addBookForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const form = e.target;
    const title = form.querySelector('input[name="title"]').value.trim();
    const authorFullName = form.querySelector('input[name="author_name"]')?.value.trim();
    const publisherName = form.querySelector('input[name="publisher_name"]')?.value.trim();

    if (!title || !authorFullName || !publisherName) {
        return alert("Please fill in all fields.");
    }

    const [first_name, ...rest] = authorFullName.split(" ");
    const last_name = rest.join(" ") || "-";

    // Hent eksisterende forfattere
    const authorRes = await fetch(`${BASE_URL}/authors`);
    const authors = await authorRes.json();
    let author = authors.find(a => a?.author_name?.toLowerCase() === authorFullName.toLowerCase());

    //  Hvis forfatter ikke findes, opret ny
    if (!author) {
        const formData = new FormData();
        formData.append("first_name", first_name);
        formData.append("last_name", last_name);

        const createAuthorRes = await fetch(`${BASE_URL}/admin/${userId}/authors`, {
            method: 'POST',
            headers: tokenHeader(),
            body: formData
        });

        const text = await createAuthorRes.text();
        if (!createAuthorRes.ok) {
            console.error("Author error:", text);
            return alert("Error creating author.");
        }

        const createdAuthor = JSON.parse(text);
        author = { author_id: createdAuthor.author_id };
    }

    // Hent eksisterende forlag
    const publisherRes = await fetch(`${BASE_URL}/publishers`);
    const publishers = await publisherRes.json();
    let publisher = publishers.find(p => p?.publisher_name?.toLowerCase() === publisherName.toLowerCase());

    // Hvis forlag ikke findes, opret ny
    if (!publisher) {
        const formData = new FormData();
        formData.append("name", publisherName);

        const createPublisherRes = await fetch(`${BASE_URL}/admin/${userId}/publishers`, {
            method: 'POST',
            headers: tokenHeader(),
            body: formData
        });

        const text = await createPublisherRes.text();
        if (!createPublisherRes.ok) {
            console.error("Publisher error:", text);
            return alert("Error creating publisher.");
        }

        const createdPublisher = JSON.parse(text);
        publisher = { publisher_id: createdPublisher.publisher_id };
    }

    // Tilføj bog
    const year = new Date().getFullYear();
    const bookFormData = new FormData();
    bookFormData.append("title", title);
    bookFormData.append("author_id", author.author_id);
    bookFormData.append("publisher_id", publisher.publisher_id);
    bookFormData.append("publishing_year", year);

    const res = await fetch(`${BASE_URL}/admin/${userId}/books`, {
        method: 'POST',
        headers: {
            'X-Session-Token': token
        },
        body: bookFormData
    });

    const text = await res.text();
    if (!res.ok) {
        console.error("Book create error:", text);
        return alert("Error adding book.");
    }

    alert("Book added: " + title);
    form.reset();
});








// ───── Tilføj forfatter ─────
document.getElementById('addAuthorForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const fullName = form.querySelector('input[name="first_name"]').value.trim();

    if (!fullName) return alert("Please enter a name.");

    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || "-";

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);

    try {
        const res = await fetch(`${BASE_URL}/admin/${userId}/authors`, {
            method: 'POST',
            headers: tokenHeader(), // ingen Content-Type!
            body: formData
        });

        const text = await res.text();
        if (!res.ok) {
            console.error("Author response:", text);
            return alert("Error creating author.");
        }

        alert("Author added: " + fullName);
        form.reset();
    } catch (err) {
        console.error("Author create error:", err);
        alert("Something went wrong.");
    }
});


// ───── Tilføj forlag ─────
document.getElementById('addPublisherForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('input[name="publisher_name"]').value.trim();

    if (!name) return alert("Please enter a publisher name.");

    const formData = new FormData();
    formData.append('name', name);

    try {
        const res = await fetch(`${BASE_URL}/admin/${userId}/publishers`, {
            method: 'POST',
            headers: tokenHeader(),
            body: formData
        });

        const text = await res.text();
        if (!res.ok) {
            console.error("Publisher response:", text);
            return alert("Error creating publisher.");
        }

        alert("Publisher added: " + name);
        form.reset();
    } catch (err) {
        console.error("Publisher create error:", err);
        alert("Something went wrong.");
    }
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

// Hent brugerdata og vis i profil
fetch(`${BASE_URL}/users/${userId}`, {
    headers: tokenHeader()
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

// Navigationsklik
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
