import { BASE_URL } from './info.js';

// ─────────────── Profile ───────────────

// ─────────────── Navigation ───────────────

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

// ─────────────── Rendering af indhold ───────────────

// Hent brugerdata
const userId = sessionStorage.getItem('book_app_user_id');
const token = sessionStorage.getItem('book_app_user_token');

if (!userId || !token) {
    window.location.href = 'login.html';
}

let originalUserData = null;

// Hjælpefunktion til at opdatere tekstindhold
function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

// Viser statusbeskeder til brugeren
function showStatus(message, type = 'info') {
    const existing = document.getElementById('statusMessage');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.id = 'statusMessage';
    msg.textContent = message;
    msg.setAttribute('role', 'alert');
    msg.setAttribute('aria-live', 'polite');
    msg.style.padding = '1rem';
    msg.style.marginBottom = '1rem';
    msg.style.borderRadius = '8px';
    msg.style.backgroundColor = type === 'error' ? '#ffd2d2' : '#d2ffd2';
    msg.style.color = '#333';
    msg.style.textAlign = 'center';

    const form = document.getElementById('editUserForm');
    form.prepend(msg);

    setTimeout(() => msg.remove(), 4000);
}

// Henter brugerens data og udfylder formularfelter og visningsfelter
fetch(`${BASE_URL}/users/${userId}`, {
    headers: {
    'X-Session-Token': token
    }
})

.then(res => {
    if (!res.ok) throw new Error('User data could not be retrieved');
    return res.json();
})

.then(data => {
    originalUserData = structuredClone(data);

    document.getElementById('txtFirstname').value = data.first_name;
    document.getElementById('txtLastname').value = data.last_name;
    document.getElementById('txtEmail').value = data.email;
    document.getElementById('txtAddress').value = data.address;
    document.getElementById('txtPhone').value = data.phone_number;
    document.getElementById('txtBirthdate').value = data.birth_date;

    setText('#name', `${data.first_name} ${data.last_name}`);
    setText('#email', data.email);
    setText('#birth', data.birth_date);
    setText('#address', data.address);
    setText('#phone', data.phone_number);
    setText('#member', data.membership_date);
})

.catch(err => {
    console.error('Error loading user data:', err);
    alert('An error occurred while retrieving your profile information.');
});

// ─────────────── Opdatering af oplysninger ───────────────

// Gemmer oplysninger
document.getElementById('editUserForm').addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('first_name', document.getElementById('txtFirstname').value.trim());
    formData.append('last_name', document.getElementById('txtLastname').value.trim());
    formData.append('email', document.getElementById('txtEmail').value.trim());
    formData.append('address', document.getElementById('txtAddress').value.trim());
    formData.append('phone_number', document.getElementById('txtPhone').value.trim());
    formData.append('birth_date', document.getElementById('txtBirthdate').value);

    try {
    const res = await fetch(`${BASE_URL}/users/${userId}`, {
        // Backend tillader kun PUT
        method: 'PUT',
        headers: {
        'X-Session-Token': token
        // IKKE Content-Type — browser sætter multipart/form-data selv
        },
        body: formData
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error('The information could not be updated');
    }

    showStatus('Your information was saved!', 'success');

    originalUserData = {
        // Underscore er brugt, da det er fra databasen
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        address: formData.get('address'),
        phone_number: formData.get('phone_number'),
        birth_date: formData.get('birth_date')
    };

    } catch (err) {
    console.error('Update error:', err);
    showStatus('Error: Information was not saved', 'error');
    }
});

// ─────────────── Annullering af nye oplysninger ───────────────

// Annuller ændringer
document.getElementById('btnCancel').addEventListener('click', () => {
    if (!originalUserData) return;

    document.getElementById('txtFirstname').value = originalUserData.first_name;
    document.getElementById('txtLastname').value = originalUserData.last_name;
    document.getElementById('txtEmail').value = originalUserData.email;
    document.getElementById('txtAddress').value = originalUserData.address;
    document.getElementById('txtPhone').value = originalUserData.phone_number;
    document.getElementById('txtBirthdate').value = originalUserData.birth_date;

    showStatus('Changes canceled.');
});

// ─────────────── Sletning af brugere ───────────────

// Slet bruger / Fjern bruger
document.getElementById('btnDelete').addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to delete your profile? This action cannot be undone.');

    if (!confirmed) return;

    try {
    const res = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
        'X-Session-Token': token
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Error while deleting profile:', errorText);
        alert('Your profile could not be deleted. Please try again later.');
        return;
    }

    alert('Your profile has been deleted. You will now be logged out.');
    sessionStorage.removeItem('book_app_user_id');
    sessionStorage.removeItem('book_app_user_token');
    sessionStorage.removeItem('book_app_user_is_admin');
    window.location.href = 'login.html';

    } catch (err) {
    console.error('Network error while deleting profile:', err);
    alert('A network error occurred while deleting your profile. Please try again.');
    }
});