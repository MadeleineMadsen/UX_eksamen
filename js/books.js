import { baseBookApiUrl } from './info.js';
import {
  handleAPIError,
  handleFetchCatchError,
  handleCloseDialogButton
} from './common.js';

const listEl        = document.getElementById('book-list');
const searchInput   = document.getElementById('txtSearch');
const suggContainer = document.getElementById('suggestions');

let abortController = null;

/** ────────────────────────────────────────
 *  1) Hent og vis 15 tilfældige bøger
 *  ──────────────────────────────────────── */
async function loadRandom() {
  await loadBooks({ n: 15 }, listEl);
}

/** ────────────────────────────────────────
 *  2) Hent bøger med valgfri query og vis i en given container
 *  ──────────────────────────────────────── */
async function loadBooks(params, container) {
  const qs    = new URLSearchParams(params);
  const res   = await fetch(`${baseBookApiUrl}/books?${qs}`);
  const books = await handleAPIError(res);

  // slå cover ind via detail-kald
  const booksWithCover = await Promise.all(books.map(async b => {
    try {
      const det    = await handleAPIError(
        await fetch(`${baseBookApiUrl}/books/${b.book_id}`)
      );
      return { ...b, cover: det.cover };
    } catch {
      return { ...b, cover: null };
    }
  }));

  renderBooks(booksWithCover, container);
}


/** ────────────────────────────────────────
 *  3) Render book-cards i container
 *  ──────────────────────────────────────── */

function renderBooks(books, container) {
  const DEFAULT_COVER = 'img/den-lille-prins.png';
  container.innerHTML = '';
  books.forEach(b => {
    const { book_id, title, author, cover } = b;
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.bookId = book_id;
    card.dataset.title  = title;
    card.dataset.author = author;
    const imgSrc = cover || DEFAULT_COVER;

    card.innerHTML = `
    
      <div class="book-image">
        <img
          src="${imgSrc}"
          alt="Forside af ${title}"
          onerror="this.src='${DEFAULT_COVER}'"
        />
      </div>
      <h3 class="book-title">${title}</h3>
      <p class="book-author">${author}</p>
      <button class="btn--book-info">Læs om</button>
    `;
    container.append(card);
  });
}



/** ────────────────────────────────────────
 *  4) Popup ved klik på "Læs om"
 *  ──────────────────────────────────────── */
document.body.addEventListener('click', async e => {
  if (!e.target.matches('.btn--book-info')) return;
  const id = e.target.closest('.book-card').dataset.bookId;
  try {
    const res  = await fetch(`${baseBookApiUrl}/books/${id}`);
    const book = await handleAPIError(res);
    showPopup(book);
  } catch (err) {
    handleFetchCatchError(err);
  }
});

/** ────────────────────────────────────────
 *  5) Byg og vis dialog
 *  ──────────────────────────────────────── */
function showPopup({ title, author, cover, publishing_year, publishing_company }) {
  const dialog = document.createElement('dialog');
  const DEFAULT_COVER = 'img/den-lille-prins.png';
  dialog.className = 'book-popup';
  const imgSrc = cover || DEFAULT_COVER;

  dialog.className = 'book-popup';
  dialog.innerHTML = `
    <header class="popup-header">
      <h2>${title}</h2>
      <button class="close" aria-label="Luk">&times;</button>
    </header>

    <div class="popup-body">
      <div class="popup-image">
        <img src="${imgSrc}"
        alt="Forside af ${title}"
        onerror="this.src='${DEFAULT_COVER}'">
      </div>

      <div class="popup-info">
        <h3>Forfatter</h3>
        <p>${author}</p>
        <p><strong>År:</strong> ${publishing_year}</p>
        <p><strong>Forlag:</strong> ${publishing_company}</p>
      </div>
    </div>

    <footer class="popup-footer">
      <button class="btn--loan">Lån bog</button>
    </footer>
  `;
  dialog.querySelectorAll('.close, .btn--loan')
        .forEach(el => el.addEventListener('click', handleCloseDialogButton));
  document.body.append(dialog);
  dialog.showModal();
}

/** ────────────────────────────────────────
 *  6) Live‐search: vis suggestions under input
 *  ──────────────────────────────────────── */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  // cancel tidligere
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
      suggContainer.innerHTML = books
        .map(b => `<li data-title="${b.title}">${b.title}</li>`)
        .join('');
      suggContainer.hidden = books.length === 0;
    })
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
});

// Klik på et suggestion‐item
suggContainer.addEventListener('click', e => {
  if (!e.target.matches('li')) return;
  const title = e.target.dataset.title;
  searchInput.value = title;
  suggContainer.hidden = true;
  // evt. trig loadBooks med { s: title } hvis du vil vise resultater et andet sted
});

/** ────────────────────────────────────────
 *  7) Initialiser – hent 15 bøger
 *  ──────────────────────────────────────── */
loadRandom();
