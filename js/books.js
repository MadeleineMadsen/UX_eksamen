import { BASE_URL }            from './info.js';
import { handleAPIError, handleFetchCatchError, handleCloseDialogButton, loanBook} from './common.js';
import { loggedUserID, tokenHeader } from './common.js';

const listEl = document.getElementById('book-list');

// ─────────────── Navigation ───────────────

// Tjek om der er admin-adgang
const userId = sessionStorage.getItem('book_app_user_id');
const isAdmin = sessionStorage.getItem('book_app_user_is_admin') === 'true';

console.log('User ID:', userId);
console.log('Admin:', isAdmin);

// Skjul alle nav med hidden først
document.querySelector('#utility_not_logged')?.classList.add('hidden');
document.querySelector('#utility_logged_user')?.classList.add('hidden');
document.querySelector('#utility_logged_admin')?.classList.add('hidden');

// Vis relevant nav sektion
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

// ─────────────── Rendering af bøger ───────────────

// Hent og vis 10 tilfældige bøger
async function loadRandom() {
  await loadBooks({ n: 10 }, listEl);
}

// Hent bøger i en given container
async function loadBooks(params, container) {
  const qs    = new URLSearchParams(params);
  const res   = await fetch(`${BASE_URL}/books?${qs}`);
  const books = await handleAPIError(res);

  // Hent billedcover ind via detail-kald
  const booksWithCover = await Promise.all(books.map(async b => {
    try {
      const det    = await handleAPIError(
        await fetch(`${BASE_URL}/books/${b.book_id}`)
      );
      return { ...b, cover: det.cover };
    } catch {
      return { ...b, cover: null };
    }
  }));

  renderBooks(booksWithCover, container);
}

// ─────────────── Rendering af cards ───────────────

// Render book-cards i container
function renderBooks(books, container) {
  const DEFAULT_COVER = 'images/placeholder.svg';
  container.innerHTML = '';

  books.forEach(book => {
    // Underscore er brugt, da det er fra databasen
    const { book_id, title, author, cover } = book;
    const card = document.createElement('article');
    card.className      = 'book-card';
    card.dataset.bookId = book_id;
    card.dataset.title = title;
    card.dataset.author = author;
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Book: ${title} by ${author}`);

    const imgSrc = cover || DEFAULT_COVER;
    card.innerHTML      = `
      <div class="book-image">
        <img
          src="${imgSrc}"
          alt="Bookcover of ${title}"
          aria-hidden="true"
          onerror="this.src='${DEFAULT_COVER}'"
        />
      </div>
      <h3 class="book-title">${title}</h3>
      <button class="btn--book-info" aria-label="See more information about ${title}">See more</button>
    `;

    // Render indhold på book-cards ud fra hvilken bruger der er logget ind
    const infoBtn = card.querySelector('.btn--book-info');
    infoBtn.addEventListener('click', async () => {
      try {
        let fullBook;
        if (isAdmin) {
          // Admin: hent detaljer + loans
          const res = await fetch(
            `${BASE_URL}/admin/${loggedUserID()}/books/${book_id}`,
            { headers: tokenHeader() }
          );
          fullBook = await handleAPIError(res);
        } else {
          // User: hent kun detaljer og giv showPopup en tom loans-array
          const res    = await fetch(`${BASE_URL}/books/${book_id}`);
          const basic  = await handleAPIError(res);
          fullBook = { ...basic, book_id, loans: [] };
        }
        showPopup(fullBook);
      } catch (err) {
        handleFetchCatchError(err);
      }
    });

    container.append(card);
  });
}

// ─────────────── Popup ───────────────

function showPopup(book) {
  // Underscore er brugt, da det er fra databasen
  const {
    book_id,
    title,
    author,
    cover,
    publishing_year,
    publishing_company,
    loans
  } = book;

  const DEFAULT_COVER = 'images/placeholder.svg';
  const imgSrc        = cover || DEFAULT_COVER;
  const userId        = sessionStorage.getItem('book_app_user_id'); // tjek login

  const dialog = document.createElement('dialog');
  dialog.className = 'book-popup';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-labelledby', 'popup-title');

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
        <button class="close">&times;</button>
        <h3 id="popup-title">${title}</h3>
        <p><strong>Author:</strong> ${author}</p>
        <p><strong>Year:</strong> ${publishing_year}</p>
        <p><strong>Publisher:</strong> ${publishing_company}</p>

        <!-- Hvis admin er logget ind -->
        ${isAdmin ? `
          <p><strong>Loan history:</strong></p>
          <ul class="loan-history"></ul>
        ` : ''}

        <!-- Knappen vises for alle ikke-admin, men opfører sig forskelligt -->
        ${!isAdmin ? `<button type="button" class="btn--loan" aria-label="Loan ${title} by ${author}">Loan</button>` : ''}
      </div>
    </div>
  `;

  // Luk-knap
  dialog.querySelector('.close')
        .addEventListener('click', handleCloseDialogButton);


  // ─────────────── Rendering af lånehistorik for admin ───────────────

  // Fyld historik hvis admin
  const historyEl = dialog.querySelector('.loan-history');
  if (historyEl) {
    if (loans.length) {
      loans.sort((a,b)=>new Date(b.loan_date) - new Date(a.loan_date))
          .forEach(({user_id,loan_date})=>{
            const li = document.createElement('li');
            li.textContent = `User ${user_id} – ${new Intl.DateTimeFormat('da-DK').format(new Date(loan_date))}`;
            historyEl.append(li);
          });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No previous loans';
      historyEl.append(li);
    }
  }

  // ─────────────── Låne knap redirecter alt efter om man er logget ind eller ikke ───────────────

  // Loan-knap: hvis ikke-logget -> til login, ellers kald loanBook
  const loanBtn = dialog.querySelector('.btn--loan');
  if (loanBtn) {
    loanBtn.addEventListener('click', async () => {
      if (!userId) {
        // ingen bruger i sessionStorage
        window.location.href = 'login.html';
        return;
      }
      try {
        await loanBook(book_id);
        handleCloseDialogButton.call(loanBtn);
        alert(
          'Your loan has been registered!\n' +
          'You’ll have access to the e-book for 30 days – a link will be sent to your email.'
        );
      } catch {
        alert('You’ve already loand this book');
      }
    });
  }

  document.body.append(dialog);
  dialog.showModal();
}

export { showPopup };

loadRandom();

