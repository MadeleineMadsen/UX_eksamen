// common.js
import { BASE_URL } from './info.js';  

// ──────────────────────────────────────────────────────────────────────────────
// Henter det loggede bruger-ID (eller 0)
export const loggedUserID = () =>
    Number(sessionStorage.getItem('book_app_user_id') || 0);

// Returnerer en Headers med X-Session-Token
export const tokenHeader = () =>
    new Headers({ 'X-Session-Token': sessionStorage.getItem('book_app_user_token') });

// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
/**
 * Håndterer en fetch-catch, viser en fejlbesked i <main>
 */
export const handleFetchCatchError = (error) => {
    const errorSection = document.createElement('section');
    errorSection.innerHTML = `
    <header><h3>Error</h3></header>
    <p>Der opstod en fejl under hentning af data.</p>
    <p class="error">${error}</p>
    `;
    document.querySelector('main').append(errorSection);
};

/**
 * Håndterer en fetch-response – kaster hvis ikke OK
 */
export const handleAPIError = (response) => {
    if (response.ok) return response.json();
    throw new Error(`HTTP ${response.status}`);
};

/**
 * Klik på .close eller .close-btn lukker og fjerner dialogen
 */
export const handleCloseDialogButton = function() {
    const dlg = this.closest('dialog');
    dlg.close();
    dlg.remove();
};
