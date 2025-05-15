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

async function loadRandom() {
    try {
        const res = await fetch(`${baseBookApiUrl}/authors`);
        const authors = await handleAPIError(res);

    // ← ÆNDRET: gem både id og name
    groups = authors.reduce((acc, a) => {
        const letter = a.author_name.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push({
        id:   a.author_id,   // ← NY
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

// ────────────────────────────────────────────────────────────────
// ← FJERNDET: det gamle klik‐listener som brugte det forkerte endpoint
// ────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────
// NY: Popup ved klik på forfatternavn
// ────────────────────────────────────────────────────────────────
document.body.addEventListener('click', async e => {
  // kun hvis vi klikker på et <li> som har data-author-id
    const li = e.target.closest('li[data-author-id]');
    if (!li) return;

    const authorId   = li.dataset.authorId;      // ← NY
    const authorName = li.textContent.trim();

    try {
    // ← ÆNDRET: korrekt endpoint /books?a=<author_id>
        const res   = await fetch(`${baseBookApiUrl}/books?a=${authorId}`);
        const books = await handleAPIError(res);


// 2) Udvid hver bog med cover via detail-kald
    const booksWithCover = await Promise.all(
        books.map(async b => {
            try {
         // Gentag præcis som i books.js:
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
                <p class="book-title">${b.title || '– ingen titel –'}</p>
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






















// import { baseBookApiUrl } from './info.js';
// import {
//     handleAPIError,
//     handleFetchCatchError,
//     handleCloseDialogButton
// } from './common.js';

// const listEl    = document.getElementById('author-list');
// const navEl     = document.getElementById('letter-nav');

// let groups = {};   // her gemmer vi forfatterne efter bogstav
// let current = 'A'; // default visning

// async function loadRandom() {
//     try {
//     const res = await fetch(`${baseBookApiUrl}/authors`); // hent op til 100, justér som ønsket
//     const authors = await handleAPIError(res);

//     // Gruppér dem efter første bogstav
//     groups = authors.reduce((acc, a) => {
//         const letter = a.author_name.charAt(0).toUpperCase();
//         if (!acc[letter]) acc[letter] = [];
//         acc[letter].push({ id: a.author_id, name: a.author_name });
//         return acc;        return acc;
//     }, {});

//     buildNav();        // Lav bogstavs-knapperne
//     showGroup(current); // Vis default "A"
//     } catch (err) {
//     handleFetchCatchError(err);
//     }
// }

// function buildNav() {
//     navEl.innerHTML = '';
//   // Tag alle bogstaver som findes, sorter alfabetisk
//     const letters = Object.keys(groups).sort();
//     letters.forEach(letter => {
//     const btn = document.createElement('button');
//     btn.textContent = letter;
//     btn.dataset.letter = letter;
//     if (letter === current) btn.classList.add('selected');

//     btn.addEventListener('click', () => {
//         if (letter === current) return;
//         current = letter;
//       // marker knapper
//         navEl.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
//         btn.classList.add('selected');
//         showGroup(letter);
//     });

//     navEl.append(btn);
//     });
// }

// function showGroup(letter) {
//     listEl.innerHTML = '';
//     const names = groups[letter] || [];

//     const section = document.createElement('section');
//     section.className = 'author-group';
//     section.innerHTML = `
//     <h2>${letter}</h2>
//     <ul>
//     ${names
//         .map(n => `<li data-author-id="${n.id}">${n.name}</li>`)
//         .join('')}
//     </ul>
//     `;
//     listEl.append(section);
// }

// // // Popup-handler (kan beholde som du havde den)
// // document.body.addEventListener('click', async e => {
// //     if (!e.target.matches('li')) return;
// //   // hvis du ønsker popup på navn, kan du fange klik her...
// //   // const name = e.target.textContent;
// //   // showPopupForName(name);
// // });

// // loadRandom();

// document.body.addEventListener('click', async e => {
//     // kun hvis klik er på et <li> inde i #author-list
//     if (!e.target.matches('#author-list li')) return;

//     const authorId = e.target.dataset.authorId;
//     const authorName = e.target.textContent;
//     try {
//        // Henter forfatterens bøger (justér endpoint om nødvendigt)
//         const res   = await fetch(`${baseBookApiUrl}/authors/${encodeURIComponent(authorName)}/books`);
//         const books = await handleAPIError(res);
//         showAuthorPopup(authorName, books);
//         } catch (err) {
//         handleFetchCatchError(err);
//         }
//     });

// function showAuthorPopup(authorName, books) {
//     const dialog = document.createElement('dialog');
//     dialog.className = 'author-popup';
//     dialog.innerHTML = `
//         <div class="popup-body">
//         <button class="close">&times;</button>
//         <h3>Bøger af ${authorName}</h3>
//         <ul>
//             ${books.map(b => `<li>${b.title || '– ingen titel –'}</li>`).join('')}
//         </ul>
//         </div>
//     `;
//     // bind luk-knap
//     dialog.querySelector('.close')
//         .addEventListener('click', handleCloseDialogButton);

//     document.body.append(dialog);
//     dialog.showModal();
// }
//   // ────────────────────────────────────────────────────────────

// loadRandom();


































// import { baseBookApiUrl } from './info.js';
// import {
// handleAPIError,
// handleFetchCatchError,
// handleCloseDialogButton
// } from './common.js';

// const listEl = document.getElementById('author-list');

// async function loadRandom() {
//     await loadAuthors({ n: 15 }, listEl);
// }

// async function loadAuthors(params, container) {
//     const qs      = new URLSearchParams(params);
//     const res     = await fetch(`${baseBookApiUrl}/authors?${qs}`);
//     const authors = await handleAPIError(res);

//   // Render kortene med de korrekte feltnavne
//     renderAuthors(authors, container);
// }

// function renderAuthors(authors, container) {
//     // 1) Gruppér forfattere efter første bogstav
//     const groups = authors.reduce((acc, a) => {
//         const letter = a.author_name.charAt(0).toUpperCase();
//         if (!acc[letter]) acc[letter] = [];
//         acc[letter].push(a.author_name);
//         return acc;
//     }, {});

//     // 2) Tøm container og definer alfabetet
//     container.innerHTML = '';
//     const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

//     // 3) Opret én sektion per bogstav, i rækkefølge
//     alphabet.forEach(letter => {
//       // Hvis du vil have tomme celler med, fjerner du denne if-guard
//         if (!groups[letter]) return;

//         const section = document.createElement('section');
//         section.className = 'author-group';

//       // Titel er bogstavet, paragraf er forfatternavnene
//         section.innerHTML = `
//         <h2>${letter}</h2>
//         <ul class="author-names">
//             ${groups[letter].map(name => `<li>${name}</li>`).join('')}
//         </ul>
//     `;
//         container.appendChild(section);
//     });
// }
// loadRandom();
