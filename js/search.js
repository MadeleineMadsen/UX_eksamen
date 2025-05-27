
import { BASE_URL } from './info.js';
import { handleAPIError, handleFetchCatchError, tokenHeader } from './common.js';
import { showPopup } from './books.js';  

// ─────────────── Søgefeltet ───────────────

// Hent tekst-input-feltet til søgning
const searchInput   = document.getElementById('txtSearch');

// Hent containeren til at vise forslag
const suggContainer = document.getElementById('suggestions');
let abortController = null;

// Lyt på 'input'-event på søgefeltet
searchInput.addEventListener('input', () => {

// Læs og trim brugerens søgeord
  const q = searchInput.value.trim();

// Hvis der allerede kører en forespørgsel, så afbryd den
  if (abortController) abortController.abort();
  if (!q) {
    suggContainer.hidden = true;
    return;
  }

  // ─────────────── Forespørgseler ───────────────

// Opret en ny AbortController til den kommende forespørgsel
  abortController = new AbortController();

  fetch(`${BASE_URL}/books?s=${encodeURIComponent(q)}`, {
    signal: abortController.signal
  })
    .then(handleAPIError)
    .then(books => {

    // Her tilføjer vi data-id=book_id
      suggContainer.innerHTML = books
        .map(b => `<li role="option" tabindex="0" data-id="${b.book_id}" aria-label="Book titled ${b.title}">${b.title}</li>`)
        .join('');
      suggContainer.hidden = books.length === 0;

      // Gør det muligt at vælge søgeresultater med tastatur
    suggContainer.querySelectorAll('li').forEach(item => {
      item.addEventListener('keydown', async e => {
        if (e.key === 'Enter') {
          const bookId = item.dataset.id;
          suggContainer.hidden = true;
          searchInput.value = '';
          try {
            const res = await fetch(`${BASE_URL}/books/${bookId}`);
            const book = await handleAPIError(res);
            showPopup(book);
          } catch (err) {
            handleFetchCatchError(err);
          }
        }
      });
    });
  })
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
});

// ─────────────── Foreslag ───────────────

// Klik på forslag i listen
suggContainer.addEventListener('click', async e => {
  if (!e.target.matches('li')) return;

  // Hent valgt bogs ID og nulstil UI
  const bookId = e.target.dataset.id;

  suggContainer.hidden = true;
  searchInput.value = '';

// ─────────────── Tjekning af bruger ───────────────
  try {
    // Tjek rolle og hent bogdata
    const isAdmin = sessionStorage.getItem('book_app_user_is_admin') === 'true';
    const userId  = sessionStorage.getItem('book_app_user_id');

    let book;
    if (isAdmin) {
      const res = await fetch(`${BASE_URL}/admin/${userId}/books/${bookId}`, {
        headers: tokenHeader()
      });
      book = await handleAPIError(res);
    } else {
      const res = await fetch(`${BASE_URL}/books/${bookId}`);
      const basic = await handleAPIError(res);
      book = { ...basic, book_id: bookId, loans: [] };
    }

    // Vis info-popup
    showPopup(book);
  } catch (err) {
    handleFetchCatchError(err);
  }
});


