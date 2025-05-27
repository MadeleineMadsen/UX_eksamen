
import { BASE_URL } from './info.js';
import { handleError } from './common.js';

// ─────────────── Sign up ───────────────

// Hjælpefunktioner (Validering)
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\+?\d{7,15}$/.test(phone);
}

// ─────────────── Formularen ───────────────

document.querySelector('#frmSignup').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;

  // 1) HTML Constraint API
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // 2) Indhent og trim værdier
  const firstName      = form.txtFirstname.value.trim();
  const lastName       = form.txtLastname.value.trim();
  const email          = form.txtEmail.value.trim();
  const address        = form.txtAddress.value.trim();
  const phone          = form.txtPhone.value.trim();
  const birthDate      = form.txtBirthdate.value;
  const password       = form.txtPassword.value;
  const repeatPassword = form.txtRepeatPassword.value;

  // 3) Egen e-mail-check
  if (!validateEmail(email)) {
    return handleError(new Error('Invalid email address.'));
  }

  // 4) Egen telefon-check
  if (!validatePhone(phone)) {
    return handleError(new Error('Invalid phonenumber.'));
  }

  // 5) Password match & længde
  if (password !== repeatPassword) {
    return handleError(new Error('The passwords doesn´t match.'));
  }
  if (password.length < 8) {
    return handleError(new Error('Password should be at least 8 signs.'));
  }

  // 6) Fødselsdato ikke i fremtiden
  if (new Date(birthDate) > new Date()) {
    return handleError(new Error('Date of birth can´t be in the future.'));
  }

  // --- Alt valideret: build URLSearchParams og send request ---

  const params = new URLSearchParams({
    // Underscore er brugt, da det er fra databasen
    first_name:   firstName,
    last_name:    lastName,
    email:        email,
    password:     password,
    address:      address,
    phone_number: phone,
    birth_date:   birthDate
  });

  // ─────────────── Bruger oprettet ───────────────
  try {
    const res  = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      body: params
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Signup failed');

    alert('User created! You can now log in.');
    window.location.href = 'login.html';
  } catch (err) {
    handleError(err);
  }
});

