// === HENT BRUGERDATA ===
const userId = sessionStorage.getItem('book_app_user_id');
const token = sessionStorage.getItem('book_app_user_token');

if (!userId || !token) {
    window.location.href = 'login.html';
}

let originalUserData = null;

// === Hjælpere ===
function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

function showStatus(message, type = 'info') {
    const existing = document.getElementById('statusMessage');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.id = 'statusMessage';
    msg.textContent = message;
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

// === HENT DATA ===
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
    console.error('Fejl ved indlæsning af brugerdata:', err);
    alert('Der opstod en fejl under hentning af din profilinformation.');
});

// === GEM OPDATERINGER ===
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
    const res = await fetch(`http://127.0.0.1:5555/users/${userId}`, {
      method: 'PUT', // Backend tillader kun PUT
        headers: {
        'X-Session-Token': token
        // IKKE Content-Type — browser sætter multipart/form-data selv
        },
        body: formData
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Fejl fra serveren:', errorText);
        throw new Error('Oplysningerne kunne ikke opdateres');
    }

    showStatus('Dine oplysninger blev gemt!', 'success');

    originalUserData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        address: formData.get('address'),
        phone_number: formData.get('phone_number'),
        birth_date: formData.get('birth_date')
    };

    } catch (err) {
    console.error('Fejl ved opdatering:', err);
    showStatus('Fejl: oplysninger blev ikke gemt.', 'error');
    }
});

// === ANNULLER ÆNDRINGER ===
document.getElementById('btnCancel').addEventListener('click', () => {
    if (!originalUserData) return;

    document.getElementById('txtFirstname').value = originalUserData.first_name;
    document.getElementById('txtLastname').value = originalUserData.last_name;
    document.getElementById('txtEmail').value = originalUserData.email;
    document.getElementById('txtAddress').value = originalUserData.address;
    document.getElementById('txtPhone').value = originalUserData.phone_number;
    document.getElementById('txtBirthdate').value = originalUserData.birth_date;

    showStatus('Ændringer annulleret.');
});

// === VIS / SKJUL SEKTIONER ===
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

