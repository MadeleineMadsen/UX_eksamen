import { baseBookApiUrl } from './info.js';
import {
    handleAPIError,
    handleFetchCatchError,
    handleCloseDialogButton
} from './common.js';

const listEl    = document.getElementById('author-list');
const navEl     = document.getElementById('letter-nav');

let groups = {};   // her gemmer vi forfatterne efter bogstav
let current = 'A'; // default visning

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
    const res = await fetch(`${baseBookApiUrl}/authors`); // hent op til 100, justér som ønsket
    const authors = await handleAPIError(res);

    // Gruppér dem efter første bogstav
    groups = authors.reduce((acc, a) => {
        const letter = a.author_name.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(a.author_name);
        return acc;
    }, {});

    buildNav();        // Lav bogstavs-knapperne
    showGroup(current); // Vis default "A"
    } catch (err) {
    handleFetchCatchError(err);
    }
}

function buildNav() {
    navEl.innerHTML = '';
  // Tag alle bogstaver som findes, sorter alfabetisk
    const letters = Object.keys(groups).sort();
    letters.forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.dataset.letter = letter;
    if (letter === current) btn.classList.add('selected');

    btn.addEventListener('click', () => {
        if (letter === current) return;
        current = letter;
      // marker knapper
        navEl.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        showGroup(letter);
    });

    navEl.append(btn);
    });
}

function showGroup(letter) {
    listEl.innerHTML = '';
    const names = groups[letter] || [];

    const section = document.createElement('section');
    section.className = 'author-group';
    section.innerHTML = `
    <h2>${letter}</h2>
    <ul>
    ${names.map(n => `<li>${n}</li>`).join('')}
    </ul>
    `;
    listEl.append(section);
}

// Popup-handler (kan beholde som du havde den)
document.body.addEventListener('click', async e => {
    if (!e.target.matches('li')) return;
  // hvis du ønsker popup på navn, kan du fange klik her...
  // const name = e.target.textContent;
  // showPopupForName(name);
});

loadRandom();















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
