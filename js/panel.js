document.getElementById('add_books').onclick = () => {
    document.getElementById('book_form').classList.remove('hidden');
    document.getElementById('admin').classList.add('hidden');
};
document.getElementById('personal_info').onclick = () => {
    document.getElementById('book_form').classList.add('hidden');
    document.getElementById('admin').classList.remove('hidden');
};