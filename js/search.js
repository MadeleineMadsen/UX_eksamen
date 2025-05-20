// search.js
import { baseBookApiUrl } from './info.js';
import { handleAPIError, handleFetchCatchError } from './common.js';
import { showPopup } from './books.js';  

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
// Opret en ny AbortController til den kommende forespørgsel
  abortController = new AbortController();

  fetch(`${baseBookApiUrl}/books?s=${encodeURIComponent(q)}`, {
    signal: abortController.signal
  })
    .then(handleAPIError)
    .then(books => {
    // Her tilføjer vi data-id=book_id
      suggContainer.innerHTML = books
        .map(b => `<li data-id="${b.book_id}">${b.title}</li>`)
        .join('');
      suggContainer.hidden = books.length === 0;
    })
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
});

suggContainer.addEventListener('click', async e => {
  if (!e.target.matches('li')) return;
  const bookId = e.target.dataset.id;
  // luk dropdown
  suggContainer.hidden = true;  
  // evt. ryd input     
  searchInput.value = '';            

  try {
    const res  = await fetch(`${baseBookApiUrl}/books/${bookId}`);
    const book = await handleAPIError(res);
    // genbruger popup-funktion
    showPopup(book);                 
  } catch (err) {
    handleFetchCatchError(err);
  }
});
