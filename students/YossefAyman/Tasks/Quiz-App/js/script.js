document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const stepDifficulty = document.getElementById('step-difficulty');
    const stepCategory = document.getElementById('step-category');
    const difficultyButtons = document.querySelectorAll('.difficulty-option');
    const categoryButtons = document.querySelectorAll('.category-option');
    const backBtn = document.getElementById('btn-back');

    let chosenDifficulty = '';

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-sun-fill fs-5 text-warning';
        } else {
            themeIcon.className = 'bi bi-moon-stars-fill fs-5 text-dark';
        }
    };

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));


    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });


    difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.getAttribute('data-difficulty');
        /* add local storage to store the chosen difficulty */
        localStorage.setItem('difficulty', difficulty); 
        stepDifficulty.classList.add('d-none');
        stepCategory.classList.remove('d-none');
    });
});

    backBtn.addEventListener('click', () => {
        stepCategory.classList.add('d-none');
        stepDifficulty.classList.remove('d-none');
    });

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const chosenCategory = btn.getAttribute('data-cat');
            /* add local storage to store the chosen category */
            localStorage.setItem('category', chosenCategory);
            window.location.href = './quiz.html';
        });
    });
});