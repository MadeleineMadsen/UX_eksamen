
import { BASE_URL } from './info.js';
import { handleError } from './api.js';

// Hjælpefunktioner
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
  return /^\+?\d{7,15}$/.test(phone);
}

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
    first_name:   firstName,
    last_name:    lastName,
    email:        email,
    password:     password,
    address:      address,
    phone_number: phone,
    birth_date:   birthDate
  });

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


// import { BASE_URL } from './info.js';
// import { handleError } from './api.js';

// document.querySelector('#frmSignup').addEventListener('submit', async e => {
//   e.preventDefault();
//   console.log('Signup attempted');

//   // Indhent værdier
//   const firstName = e.target.txtFirstname.value.trim();
//   const lastName = e.target.txtLastname.value.trim();
//   const email = e.target.txtEmail.value.trim();
//   const address = e.target.txtAddress.value.trim();
//   const phone = e.target.txtPhone.value.trim();
//   const birthDate = e.target.txtBirthdate.value;
//   const password = e.target.txtPassword.value;
//   const repeatPassword = e.target.txtRepeatPassword.value;

//   // Valider passwords matcher
//   if (password !== repeatPassword) {
//     handleError('Passwords do not match.');
//     return;
//   }

//   // Valider at fødselsdato ikke er i fremtiden
//   if (new Date(birthDate) > new Date()) {
//     handleError('Birth date cannot be in the future.');
//     return;
//   }

//   // Opret et objekt til at samle query-parametre
//   const params = new URLSearchParams();
//   params.append('first_name', firstName);
//   params.append('last_name', lastName);
//   params.append('email', email);
//   params.append('password', password);
//   params.append('address', address);
//   params.append('phone_number', phone);
//   params.append('birth_date', birthDate);

//   try {
// // Send POST-request til /users-endpoint med body som URL-kodede parametre
//     const res = await fetch(`${BASE_URL}/users`, {
//       method: 'POST',
//       body: params
//     });

// // Parse svaret som JSON
//     const data = await res.json();
//     console.log(data);

// // Hvis status ikke er OK (200–299), kast en fejl med serverens meddelelse
//     if (!res.ok) throw new Error(data.error || 'Signup failed');

// // Ved succes vis en bekræftelses-alert og omdiriger til login-side
//     alert('Signup successful! You can now log in.');
//     window.location.href = 'login.html';
//   } catch (err) {
//     handleError(err);
//   }
// });


