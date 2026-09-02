const browse    = document.getElementsByClassName("browse-button")[0];
const join      = document.getElementsByClassName("join-button")[0];

browse.addEventListener('click', () => {
    window.location.href = "./Html/category.html";
})

join.addEventListener('click', () => {
    window.location.href = "./Html/login.html";
})