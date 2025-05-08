/**
 * Håndterer en fetch-catch, viser en fejlbesked i <main>
 */
export const handleFetchCatchError = (error) => {
    const errorSection = document.createElement('section');
    errorSection.innerHTML = `
    <header><h3>Error</h3></header>
    <p>Der opstod en fejl under hentning af data.</p>
    <p class="error">${error}</p>
    `;
    document.querySelector('main').append(errorSection);
};

/**
   * Håndterer en fetch-response – kaster hvis ikke OK
   */
export const handleAPIError = (response) => {
    if (response.ok) return response.json();
    throw new Error(`HTTP ${response.status}`);
};

/**
   * Klik på .close eller .close-btn lukker og fjerner dialogen
   */
export const handleCloseDialogButton = function() {
    const dlg = this.closest('dialog');
    dlg.close();
    dlg.remove();
};

