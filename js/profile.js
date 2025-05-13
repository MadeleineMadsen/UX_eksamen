document.getElementById('loaned_books').onclick = () => {
    document.getElementById('my_books').classList.remove('hidden');
    document.getElementById('user_info').classList.add('hidden');
};
document.getElementById('personal_info').onclick = () => {
    document.getElementById('my_books').classList.add('hidden');
    document.getElementById('user_info').classList.remove('hidden');
};