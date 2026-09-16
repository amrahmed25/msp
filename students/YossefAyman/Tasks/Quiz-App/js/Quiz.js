// get category and difficulty
const cat           = localStorage.getItem('category');
const diff          = localStorage.getItem('difficulty');
let correctAnswers = 0;
let numberOfQ;      // will retrieve from data attribute
let totalSeconds;   // will retrieve from data attribute
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// get sections
const durationContainer      = document.querySelector('.Duration-Container');
const questionCountContainer = document.querySelector('.QuestionCount-Container');
const quizContainer          = document.querySelector('.Quiz-Container');
const dashBoardContainer     = document.querySelector('.Dashboard-Container')
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// duration section buttons functionality
const duration_btns = document.querySelectorAll('.Duration-Container button');
duration_btns.forEach(btn => {
    btn.addEventListener('click', _ => {
        totalSeconds = Number(btn.dataset.duration);
        durationContainer.classList.toggle('d-none');
        questionCountContainer.classList.toggle('d-none');

        console.log('seconds = ', totalSeconds);
    })
})
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// Number of Questions buttons functionality
const numQ_btns = document.querySelectorAll('.QuestionCount-Container button');
numQ_btns.forEach(btn => {
    btn.addEventListener('click', _ => {
        numberOfQ = Number(btn.dataset.count);
        questionCountContainer.classList.toggle('d-none');
        quizContainer.classList.toggle('d-none');
        nextQuestion();

        console.log('# Questions = ', numberOfQ);
    })
})
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// get Quiz card element DOM
const Question      = document.querySelector('.Question');
const options       = document.querySelectorAll('.option');
const sidebarImg    = document.querySelector('.Img img');
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// data from init.json
let data = null;
let randomQuestion;
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// option button clicked functionality
options.forEach(option => {
    option.addEventListener('click', () => {
        // clear Progress bar
        updateProgressBar(0, true);
        // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ

        const optionValue = option.dataset.value;
        const correctAnswerIndex = randomQuestion.correctAnswer;

        // check if buttons disabled then return, otherwise disable buttons
        if (option.disable)
            return;
        setButtonsDisabled(true);
        // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ

        // Show answer correctness
        if (optionValue == correctAnswerIndex) {
            option.classList.add('btn-success');
            correctAnswers++;
        } else {
            option.classList.add('btn-danger');
            options[correctAnswerIndex - 1].classList.add('btn-success');
        }
        // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
        
        // Show next Question
        // console.log(new Date().toLocaleTimeString());
        // randomQuestion = getRandomQuestion();
        setTimeout(nextQuestion, 2000);
        // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    })
})

// disable and enable buttons after click
function setButtonsDisabled(isDisabled) {
    options.forEach(btn => btn.disable = isDisabled);
}

// button init state
function resetButtonStatus() {
    options.forEach(btn => btn.classList.remove('btn-danger', 'btn-success', 'disabled'))
}
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// select Random Question from data
let qeustionsId = [];
function getRandomQuestion() {
    const availableQuestions = data.filter(item => !qeustionsId.includes(item.id));

    // console.log(qeustionsId);
    console.log(qeustionsId);
    if (availableQuestions.length === 0 || qeustionsId.length >= numberOfQ) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    qeustionsId.push(selectedQuestion.id);
    return selectedQuestion;
}
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// set card element content based on Random Question
function setCardElements() {
    randomQuestion = getRandomQuestion();

    if (randomQuestion === null) {
        // alert("finish Questions");
        renderDashBoard();
        return null;
    }

    // console.log(randomQuestion.id);
    

    Question.textContent = randomQuestion.question;
    options.forEach((option, index) => {
        option.textContent = randomQuestion.options[index];
    });


    if (randomQuestion.image == '') {
        sidebar.classList.add('d-none');
    } else {
        sidebar.classList.remove('d-none');
        sidebarImg.src = randomQuestion.image;
    }
}
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// Show next Question
function nextQuestion() {
    // set card element content based on Random Question
    if (setCardElements() === null)
        return;
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ

    // start progress bar
    startLoopingProgress();
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ

    // enable buttons 
    setButtonsDisabled(false);
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ

    // reset button state
    resetButtonStatus();
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
}
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// retrieve question data from init.json
async function retrieveData() {
    console.log('Category name: ', cat);
    
    const response = await fetch(`../data/${cat}.json`);
    const Data     = await response.json();
    return Data.filter(item => (item.category === cat && item.difficulty === diff) || (item.category === 'init' && item.difficulty === 'init') );
}
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// set Theme from local storage
function setTheme(theme) {
    const themeIcon = document.getElementById('theme-icon');

    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun-fill fs-5 text-warning';
    } else {
        themeIcon.className = 'bi bi-moon-stars-fill fs-5 text-dark';
    }
}

// toggle theme
document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// game setup functionality
document.addEventListener('DOMContentLoaded', async () => {
    window.scrollTo(0, 0);

    // set theme from local storage
    setTheme(localStorage.getItem('theme'));
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ

    // retrieve question data from init.json
    data = await retrieveData();
    console.log('Data form json: ', data);
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ

    // Show next Question
    if (!quizContainer.classList.contains('d-none'))
        nextQuestion();
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
});
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// Sidebar toggle functionality
const toggleBtn = document.getElementById('sidebarToggle');
const sidebar   = document.querySelector('.image-sidebar');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// back to setup page functionality
document.querySelector('#backSetup').addEventListener('click', _ => {
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    localStorage.setItem('theme', theme);
    window.location.href = './index.html';
});
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// counter progress bar looping functionality
const progressBar       = document.querySelector('.progress-bar');
const progressContainer = document.querySelector('.progress');
let   progressInterval  = null;

const updateProgressBar = (seconds, stop = false) => {
    if (stop) {
        clearInterval(progressInterval);
        return;
    }

    if (progressBar) {
        progressBar.style.width = `${(seconds / totalSeconds) * 100}%`;
        progressBar.textContent = `${seconds} s`;
    }
    if (progressContainer) {
        progressContainer.setAttribute('aria-valuenow', seconds);
    }

    if (seconds >= totalSeconds) {
        clearInterval(progressInterval);
        progressBar.style.setProperty('background-color', '#dc3545', 'important');
        progressBar.classList.add('progress-bar-animated');
        setButtonsDisabled(true);

        // Show correct answer and go to next Question
        options[randomQuestion.correctAnswer - 1].classList.add('btn-success');
        // randomQuestion = ();
        setTimeout(nextQuestion, 2000);

        return;
    }
}

function startLoopingProgress() {
    progressBar.style.removeProperty('background-color');
    // progressBar.classList.remove('d-none');

    if (progressInterval) clearInterval(progressInterval);

    let progressValue = 0;
    progressBar.style.width = `${(progressValue / totalSeconds) * 100}%`;
    progressBar.textContent = `${progressValue} s`;

    progressInterval = setInterval(() => {
        updateProgressBar(++progressValue);
    }, 1000);
}
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// Dash board functionality
function renderDashBoard() {
    updateProgressBar(0, true);
    // progressBar.classList.add('d-none');

    quizContainer.classList.toggle('d-none');
    dashBoardContainer.classList.toggle('d-none');

    document.getElementById('stat-total-questions').textContent = numberOfQ;
    document.getElementById('stat-time-per-question').textContent = `${totalSeconds}s`;
    document.getElementById('stat-correct-answers').textContent = correctAnswers;

    const percentage = Math.round((correctAnswers / numberOfQ) * 100);
    document.getElementById('stat-percentage').textContent = `${percentage}%`;
}
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

// restart game functionality
document.querySelector('#restart-quiz').addEventListener('click', () => {
    window.location.reload();
});
// ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ