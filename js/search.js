


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