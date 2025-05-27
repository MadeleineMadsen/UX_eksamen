
import { BASE_URL } from './info.js';  

// ─────────────── API til header ───────────────

// Henter det loggede bruger-ID (eller 0)

export const loggedUserID = () =>
    Number(sessionStorage.getItem('book_app_user_id') || 0);

// Returnerer en Headers med X-Session-Token

export const tokenHeader = () => ({
    'X-Session-Token': sessionStorage.getItem('book_app_user_token')
});


// ─────────────── API til books ───────────────

// Lån en bog via API
export async function loanBook(bookId) {
    const userId = loggedUserID();
    const res = await fetch(
    `${BASE_URL}/users/${userId}/books/${bookId}`,
    {
        method:  'POST',
        headers: tokenHeader()
    }
    );
    if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

// ─────────────── Fejlbeskeder på main ───────────────

// Håndterer en fetch-catch, viser en fejlbesked i <main>
export const handleFetchCatchError = (error) => {
    const errorSection = document.createElement('section');
    errorSection.setAttribute('role', 'alert');
    errorSection.innerHTML = `
    <header><h3>Error</h3></header>
    <p>Failed to load data</p>
    <p class="error">${error}</p>
    `;
    document.querySelector('main').append(errorSection);
};

// ─────────────── Fejlbesked til formularer ───────────────

export const handleError = (error) => {
    document.querySelector('.errorText').innerText = error;
    document.querySelector('#error').classList.remove('hidden');
};


// ─────────────── Fetch response ───────────────

/* Håndterer en fetch-response – kaster hvis ikke OK */
export const handleAPIError = (response) => {
    if (response.ok) return response.json();
    throw new Error(`HTTP ${response.status}`);
};

// ─────────────── Close button til popup ───────────────

/* Klik på .close eller .close-btn lukker og fjerner dialogen */
export const handleCloseDialogButton = function() {
    const dlg = this.closest('dialog');
    dlg.close();
    dlg.remove();
};