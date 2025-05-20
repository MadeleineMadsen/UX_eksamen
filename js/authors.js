import { baseBookApiUrl } from './info.js';
import {
handleAPIError,
handleFetchCatchError,
handleCloseDialogButton
} from './common.js';

const listEl    = document.getElementById('author-list');
const navEl     = document.getElementById('letter-nav');

let groups = {};
let current = 'A';

// Navigation
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

// Load forfattere fra API´en
async function loadRandom() {
    try {
        const res = await fetch(`${baseBookApiUrl}/authors`);
        const authors = await handleAPIError(res);

// Gem både id og navn på forfattere
    groups = authors.reduce((acc, a) => {
        const letter = a.author_name.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push({
        id:   a.author_id,  
        name: a.author_name
    });
        return acc;
    }, {});

    buildNav();
    showGroup(current);
    } catch (err) {
    handleFetchCatchError(err);
    }
}

// Lav en knap for hvert bogstav A-Z
function buildNav() {
    navEl.innerHTML = '';
    const letters = Object.keys(groups).sort();
    letters.forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.dataset.letter = letter;
    if (letter === current) btn.classList.add('selected');
    btn.addEventListener('click', () => {
        if (letter === current) return;
        current = letter;
        navEl.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        showGroup(letter);
    });
    navEl.append(btn);
    });
}

// Vis alle forfattere med det valgte bogstav
function showGroup(letter) {
    listEl.innerHTML = '';
    const authors = groups[letter] || [];

    const section = document.createElement('section');
    section.className = 'author-group';
    section.innerHTML = `
    <h2>${letter}</h2>
    <ul>
        ${authors.map(a =>
        // ← ÆNDRET: tilføj data-author-id
        `<li data-author-id="${a.id}">${a.name}</li>`
        ).join('')}
    </ul>
`;
listEl.append(section);
}

// Pop op ved klik på forfatter
document.body.addEventListener('click', async e => {
  // virker kun hvis vi klikker på et <li> som har data-author-id
    const li = e.target.closest('li[data-author-id]');
    if (!li) return;

    const authorId   = li.dataset.authorId;     
    const authorName = li.textContent.trim();

    try {
    // fetcher data med endpoint /books?a=<author_id>
        const res   = await fetch(`${baseBookApiUrl}/books?a=${authorId}`);
        const books = await handleAPIError(res);


// Udvid hver bog med billedcover
    const booksWithCover = await Promise.all(
        books.map(async b => {
            try {
            const det = await handleAPIError(
            await fetch(`${baseBookApiUrl}/books/${b.book_id}`)
        );
        return { ...b, cover: det.cover };
        } catch {
        return { ...b, cover: null };
        }
    })
);

    showAuthorPopup(authorName, booksWithCover);
    } catch (err) {
    handleFetchCatchError(err);
    }
});

// Vis pop-up med forfatterens bøger
function showAuthorPopup(authorName, books) {
    const dialog = document.createElement('dialog');
    dialog.className = 'author-popup';
    const DEFAULT_COVER = 'images/placeholder.svg'; 
    
    dialog.innerHTML = `
    <div class="popup-info-author">
    <button class="close">&times;</button>
    <h3 id="books_by">Books by ${authorName}</h3>
    <ul class="book-by-author">
        ${books.map(b => {
            const imgSrc = b.cover || DEFAULT_COVER;                                  
            return `
            <li class="book-item">
                <div class="book-cover">                                          
                <img
                    src="${imgSrc}"
                    alt="Forside af ${b.title}"
                    onerror="this.src='${DEFAULT_COVER}'"
                />
                </div>
                <p class="book-title">${b.title || '– no title –'}</p>
            </li>`;
        }).join('')}
        </ul>
    </div>
`;
    dialog.querySelector('.close')
        .addEventListener('click', handleCloseDialogButton);
    document.body.append(dialog);
    dialog.showModal();
}

loadRandom();
