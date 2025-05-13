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
 *  1) Navigation
 *  ──────────────────────────────────────── */

const userId = sessionStorage.getItem('book_app_user_id');
const isAdmin = sessionStorage.getItem('book_app_user_is_admin') === 'true';

console.log('User ID:', userId);
console.log('Admin:', isAdmin);

// Skjul alle først
document.querySelector('#utility_not_logged')?.classList.add('hidden');
document.querySelector('#utility_logged_user')?.classList.add('hidden');
document.querySelector('#utility_logged_admin')?.classList.add('hidden');

// Vis relevant sektion
if (!userId) {
  document.querySelector('#utility_not_logged')?.classList.remove('hidden');
} else if (isAdmin) {
  document.querySelector('#utility_logged_admin')?.classList.remove('hidden');
} else {
  document.querySelector('#utility_logged_user')?.classList.remove('hidden');
}

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

/** ────────────────────────────────────────
 *  1) Hent og vis 15 tilfældige bøger
 *  ──────────────────────────────────────── */
async function loadRandom() {
  await loadBooks({ n: 12 }, listEl);
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
 * 
 *  ──────────────────────────────────────── */

function renderBooks(books, container) {
  const DEFAULT_COVER = 'images/placeholder.svg';
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
      <button class="btn--book-info">See more</button>
    
      
    `;
    container.append(card);
  });
}



/** ────────────────────────────────────────
 *  4) Popup ved klik på "Læs om"
 *  ──────────────────────────────────────── */
document.body.addEventListener('click', async e => {
  // hvis vi ikke ved et klik inde i selve .book-card, så gør vi ingenting
  const card = e.target.closest('.book-card');
  if (!card) return;

  // find book_id og vis popup
  const id = card.dataset.bookId;
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
  dialog.className = 'book-popup';
  const DEFAULT_COVER = 'images/placeholder.svg';
  const imgSrc        = cover || DEFAULT_COVER;

  dialog.innerHTML = `
    <div class="popup-body">
      <div class="popup-image">
        <img
          src="${imgSrc}"
          alt="Forside af ${title}"
          onerror="this.src='${DEFAULT_COVER}'"
        />
      </div>
      <div class="popup-info">
      <button class="close" "Luk">&times;</button>
      
        <h3>${title}</h3>
        <p><strong>Author: </strong>${author}</p>
        <p> <strong>Year: </strong>${publishing_year}</p>
        <p> <strong>Publisher: </strong>${publishing_company}</p>
        <a href="login.html" class="btn--loan">Loan</a>
      </div>
    </div>


  `;

  // bind luk-knapper
  dialog.querySelectorAll('.close')
        .forEach(el => el.addEventListener('click', handleCloseDialogButton));
   // Lån-bog redirect + luk
  dialog.querySelector('.btn--loan').addEventListener('click', e => {
    // Luk dialogen
    handleCloseDialogButton.call(e.currentTarget);
    // Navigate til login (tilpas stien hvis nødvendigt)
    window.location.href = 'login.html';
  });
  document.body.append(dialog);
  dialog.showModal();
}
export { showPopup };

/** ────────────────────────────────────────
 *  6) Live‐search: vis suggestions under input
 *  ──────────────────────────────────────── */
// searchInput.addEventListener('input', () => {
//   const q = searchInput.value.trim();
//   // cancel tidligere
//   if (abortController) abortController.abort();
//   if (!q) {
//     suggContainer.hidden = true;
//     return;
//   }
//   abortController = new AbortController();
//   fetch(`${baseBookApiUrl}/books?s=${encodeURIComponent(q)}`, {
//     signal: abortController.signal
//   })
//     .then(handleAPIError)
//     .then(books => {
//       suggContainer.innerHTML = books
//         .map(b => `<li data-title="${b.title}">${b.title}</li>`)
//         .join('');
//       suggContainer.hidden = books.length === 0;
//     })
//     .catch(err => {
//       if (err.name !== 'AbortError') console.error(err);
//     });
// });

// // Klik på et suggestion‐item
// suggContainer.addEventListener('click', e => {
//   if (!e.target.matches('li')) return;
//   const title = e.target.dataset.title;
//   searchInput.value = title;
//   suggContainer.hidden = true;
//   // evt. trig loadBooks med { s: title } hvis du vil vise resultater et andet sted
// });

/** ────────────────────────────────────────
 *  7) Initialiser – hent 15 bøger
 *  ──────────────────────────────────────── */
loadRandom();

