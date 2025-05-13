// search.js
import { baseBookApiUrl } from './info.js';
import { handleAPIError, handleFetchCatchError } from './common.js';
import { showPopup } from './books.js';  // antag vi eksporterer showPopup

const searchInput   = document.getElementById('txtSearch');
const suggContainer = document.getElementById('suggestions');
let abortController = null;

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (abortController) abortController.abort();
  if (!q) {
    suggContainer.hidden = true;
    return;
  }
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
  suggContainer.hidden = true;       // luk dropdown
  searchInput.value = '';            // evt. ryd input

  try {
    const res  = await fetch(`${baseBookApiUrl}/books/${bookId}`);
    const book = await handleAPIError(res);
    showPopup(book);                 // genbruger din popup-funktion
  } catch (err) {
    handleFetchCatchError(err);
  }
});
