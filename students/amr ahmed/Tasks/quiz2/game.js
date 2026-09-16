const startScreen =
    document.getElementById("start-screen");

const arenaScreen =
    document.getElementById("arena-screen");

const gameScreen =
    document.getElementById("game-screen");

const resultScreen =
    document.getElementById("result-screen");

const playerNameInput =
    document.getElementById("player-name");

const startBtn =
    document.getElementById("start-btn");

const displayName =
    document.getElementById("display-name");

const categoryDisplay =
    document.getElementById("category-display");

const currentQuestionElement =
    document.getElementById("current-question");

const totalQuestionsElement =
    document.getElementById("total-questions");

const scoreElement =
    document.getElementById("score");

const livesElement =
    document.getElementById("lives");

const comboElement =
    document.getElementById("combo");

const xpElement =
    document.getElementById("xp");

const timerElement =
    document.getElementById("timer");

const timerCircle =
    document.getElementById("timer-circle");

const questionProgress =
    document.getElementById("question-progress");

const difficultyBadge =
    document.getElementById("difficulty-badge");

const challengeContainer =
    document.getElementById("challenge-container");

const feedbackElement =
    document.getElementById("feedback");

const finalScoreElement =
    document.getElementById("final-score");

const accuracyElement =
    document.getElementById("accuracy");

const bestComboElement =
    document.getElementById("best-combo");

const finalXpElement =
    document.getElementById("final-xp");

const rankElement =
    document.getElementById("rank");

const resultTitle =
    document.getElementById("result-title");

const resultCategory =
    document.getElementById("result-category");

const resultDifficulty =
    document.getElementById("result-difficulty");

const playAgainBtn =
    document.getElementById("play-again");

const changeArenaBtn =
    document.getElementById("change-arena");

const homeBtn =
    document.getElementById("home-btn");

// ===================== SOUND SETUP =====================

const muteBtn =
    document.getElementById("mute-btn");

const backgroundSound =
    new Audio("background_sound.mp3");

backgroundSound.loop = true;
backgroundSound.volume = 0.5;

const winnerSound =
    new Audio("winner.mp3");

const applauseSound =
    new Audio("1789583658453_applause.wav");

const gameoverSound =
    new Audio("gameover.mp3");

let isMuted = false;

function updateMuteIcon() {
    muteBtn.textContent =
        isMuted ? "🔇" : "🔊";

    muteBtn.classList.toggle(
        "muted",
        isMuted
    );
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.muted = isMuted;
    sound.play();
}

muteBtn.addEventListener(
    "click",
    function() {
        isMuted = !isMuted;

        backgroundSound.muted = isMuted;
        winnerSound.muted = isMuted;
        applauseSound.muted = isMuted;
        gameoverSound.muted = isMuted;

        updateMuteIcon();
    }
);

updateMuteIcon();

// =========================================================

const questionBank = {
    public: {
        easy: [
            {
                question:
                    "Which planet is known as the Red Planet?",
                answers: [
                    "Venus",
                    "Mars",
                    "Jupiter",
                    "Mercury"
                ],
                correct: "Mars"
            },
            {
                question:
                    "How many continents are there?",
                answers: [
                    "5",
                    "6",
                    "7",
                    "8"
                ],
                correct: "7"
            },
            {
                question:
                    "Which animal is known as the King of the Jungle?",
                answers: [
                    "Tiger",
                    "Lion",
                    "Wolf",
                    "Elephant"
                ],
                correct: "Lion"
            },
            {
                question:
                    "What color do you get by mixing red and white?",
                answers: [
                    "Purple",
                    "Pink",
                    "Green",
                    "Orange"
                ],
                correct: "Pink"
            },
            {
                question:
                    "Which country is famous for the pyramids of Giza?",
                answers: [
                    "Egypt",
                    "Greece",
                    "Italy",
                    "Mexico"
                ],
                correct: "Egypt"
            }
        ],
        medium: [
            {
                question:
                    "What is the largest ocean on Earth?",
                answers: [
                    "Atlantic Ocean",
                    "Indian Ocean",
                    "Pacific Ocean",
                    "Arctic Ocean"
                ],
                correct: "Pacific Ocean"
            },
            {
                question:
                    "Which language is mainly used to structure web pages?",
                answers: [
                    "Python",
                    "HTML",
                    "Java",
                    "SQL"
                ],
                correct: "HTML"
            },
            {
                question:
                    "Who painted the Mona Lisa?",
                answers: [
                    "Van Gogh",
                    "Leonardo da Vinci",
                    "Picasso",
                    "Michelangelo"
                ],
                correct: "Leonardo da Vinci"
            },
            {
                question:
                    "Which organ pumps blood through the human body?",
                answers: [
                    "Brain",
                    "Liver",
                    "Heart",
                    "Lung"
                ],
                correct: "Heart"
            },
            {
                question:
                    "Which gas makes up most of Earth's atmosphere?",
                answers: [
                    "Oxygen",
                    "Nitrogen",
                    "Hydrogen",
                    "Carbon Dioxide"
                ],
                correct: "Nitrogen"
            }
        ],
        hard: [
            {
                question:
                    "Which scientist formulated the theory of relativity?",
                answers: [
                    "Isaac Newton",
                    "Albert Einstein",
                    "Galileo Galilei",
                    "Nikola Tesla"
                ],
                correct: "Albert Einstein"
            },
            {
                question:
                    "Which is the smallest country in the world?",
                answers: [
                    "Monaco",
                    "Vatican City",
                    "Malta",
                    "San Marino"
                ],
                correct: "Vatican City"
            },
            {
                question:
                    "What is the chemical symbol for gold?",
                answers: [
                    "Ag",
                    "Gd",
                    "Au",
                    "Go"
                ],
                correct: "Au"
            },
            {
                question:
                    "Which ancient civilization developed democracy in Athens?",
                answers: [
                    "Roman",
                    "Greek",
                    "Egyptian",
                    "Persian"
                ],
                correct: "Greek"
            },
            {
                question:
                    "Which layer of Earth lies directly beneath the crust?",
                answers: [
                    "Core",
                    "Mantle",
                    "Inner Core",
                    "Outer Core"
                ],
                correct: "Mantle"
            }
        ]
    },

    proverbs: {
        easy: [
            {
                emoji: "🐦 🖐️ 🐦",
                question:
                    "Which Egyptian proverb matches these emojis?",
                answers: [
                    "عصفور في اليد خير من عشرة على الشجرة",
                    "الطيور على أشكالها تقع",
                    "كل طير على شجرته يغني",
                    "اللي فات مات"
                ],
                correct:
                    "عصفور في اليد خير من عشرة على الشجرة"
            },
            {
                emoji: "👀 👂 🧠",
                question:
                    "Which proverb is represented by these emojis?",
                answers: [
                    "العين بصيرة والإيد قصيرة",
                    "اسمع كلام الكبير",
                    "العين عليها حارس",
                    "ودنك منين يا جحا"
                ],
                correct:
                    "العين بصيرة والإيد قصيرة"
            },
            {
                emoji: "🐢 🐇 🏁",
                question:
                    "Which proverb matches the idea of these emojis?",
                answers: [
                    "اللي سبق أكل النبق",
                    "في التأني السلامة وفي العجلة الندامة",
                    "البطيء دايمًا يكسب",
                    "كل تأخيرة وفيها خيرة"
                ],
                correct:
                    "في التأني السلامة وفي العجلة الندامة"
            },
            {
                emoji: "🧂 🍲 👍",
                question:
                    "Which proverb is related to salt and food?",
                answers: [
                    "الملح في الأكل",
                    "اللي ما يعرفش يقول عدس",
                    "الملح زينة الطعام",
                    "العيش والملح"
                ],
                correct:
                    "العيش والملح"
            },
            {
                emoji: "🤝 ❤️ 🍞",
                question:
                    "Which proverb is represented here?",
                answers: [
                    "العيش والملح",
                    "إيد لوحدها ما تسقفش",
                    "القلوب عند بعضها",
                    "الجار قبل الدار"
                ],
                correct:
                    "العيش والملح"
            }
        ],

        medium: [
            {
                emoji: "🏠 👨‍👩‍👦 ❤️",
                question:
                    "Which proverb fits this family/home meaning?",
                answers: [
                    "الأقارب عقارب",
                    "البيت بيتك",
                    "الجار قبل الدار",
                    "اللي بيته من إزاز ما يرميش الناس بالطوب"
                ],
                correct:
                    "اللي بيته من إزاز ما يرميش الناس بالطوب"
            },
            {
                emoji: "👨‍👩‍👦 🤝 👨‍👩‍👦",
                question:
                    "Which proverb means people should cooperate?",
                answers: [
                    "إيد لوحدها ما تسقفش",
                    "كل واحد له شغله",
                    "الجار قبل الدار",
                    "كل شيخ وله طريقة"
                ],
                correct:
                    "إيد لوحدها ما تسقفش"
            },
            {
                emoji: "🏠 ❤️ 🚪 👨‍👩‍👦",
                question:
                    "Which proverb emphasizes choosing your neighbor before your home?",
                answers: [
                    "البيت بيتك",
                    "الجار قبل الدار",
                    "الأقارب عقارب",
                    "اللي اختشوا ماتوا"
                ],
                correct:
                    "الجار قبل الدار"
            },
            {
                emoji: "👨‍🍳 🍲 🥄 😋",
                question:
                    "Which proverb means everyone has their own way?",
                answers: [
                    "كل شيخ وله طريقة",
                    "كل إناء ينضح بما فيه",
                    "اللي ما يعرفش يقول عدس",
                    "الأكل على قد الجيب"
                ],
                correct:
                    "كل شيخ وله طريقة"
            },
            {
                emoji: "🪟 🏠 🧱 👀",
                question:
                    "Which proverb warns us not to criticize others for faults we have?",
                answers: [
                    "الجار قبل الدار",
                    "اللي بيته من إزاز ما يرميش الناس بالطوب",
                    "الباب يفوت جمل",
                    "كل إناء ينضح بما فيه"
                ],
                correct:
                    "اللي بيته من إزاز ما يرميش الناس بالطوب"
            }
        ],

        hard: [
            {
                emoji: "🥛 🐄 🏃‍♂️ 💨",
                question:
                    "Which proverb means don't cry over something that has already happened?",
                answers: [
                    "اللي فات مات",
                    "سبق السيف العذل",
                    "كل تأخيرة وفيها خيرة",
                    "اللي اختشوا ماتوا"
                ],
                correct:
                    "اللي فات مات"
            },
            {
                emoji: "🧱 🏠 🔨 👀",
                question:
                    "Which proverb warns you not to judge others while having the same weakness?",
                answers: [
                    "اللي بيته من إزاز ما يرميش الناس بالطوب",
                    "الباب يفوت جمل",
                    "كل إناء ينضح بما فيه",
                    "الجار قبل الدار"
                ],
                correct:
                    "اللي بيته من إزاز ما يرميش الناس بالطوب"
            },
            {
                emoji: "🗣️ 👤 🤫 🏃",
                question:
                    "Which proverb is about revealing too much information?",
                answers: [
                    "إذا كان الكلام من فضة فالسكوت من ذهب",
                    "السكوت علامة الرضا",
                    "ودنك منين يا جحا",
                    "اللي اختشوا ماتوا"
                ],
                correct:
                    "إذا كان الكلام من فضة فالسكوت من ذهب"
            },
            {
                emoji: "⚔️ ⏰ 👨‍⚖️",
                question:
                    "Which proverb means the opportunity to complain may come too late?",
                answers: [
                    "سبق السيف العذل",
                    "اللي فات مات",
                    "كل تأخيرة وفيها خيرة",
                    "في التأني السلامة"
                ],
                correct:
                    "سبق السيف العذل"
            },
            {
                emoji: "🥣 👤 💭",
                question:
                    "Which proverb means a person reveals their character through what comes from them?",
                answers: [
                    "كل إناء ينضح بما فيه",
                    "الجار قبل الدار",
                    "الأقارب عقارب",
                    "إيد لوحدها ما تسقفش"
                ],
                correct:
                    "كل إناء ينضح بما فيه"
            }
        ]
    },

    math: {
        easy: [
            {
                question:
                    "What is 12 × 8?",
                answers: [
                    "86",
                    "96",
                    "108",
                    "88"
                ],
                correct: "96"
            },
            {
                question:
                    "What is 50 + 25?",
                answers: [
                    "65",
                    "70",
                    "75",
                    "80"
                ],
                correct: "75"
            },
            {
                question:
                    "What is 100 - 37?",
                answers: [
                    "53",
                    "63",
                    "73",
                    "67"
                ],
                correct: "63"
            },
            {
                question:
                    "What is 9 × 7?",
                answers: [
                    "54",
                    "63",
                    "72",
                    "56"
                ],
                correct: "63"
            },
            {
                question:
                    "What is 144 ÷ 12?",
                answers: [
                    "10",
                    "11",
                    "12",
                    "14"
                ],
                correct: "12"
            }
        ],

        medium: [
            {
                question:
                    "What is 15 × 14?",
                answers: [
                    "190",
                    "200",
                    "210",
                    "220"
                ],
                correct: "210"
            },
            {
                question:
                    "What is 25% of 240?",
                answers: [
                    "40",
                    "50",
                    "60",
                    "70"
                ],
                correct: "60"
            },
            {
                question:
                    "If x + 15 = 32, what is x?",
                answers: [
                    "15",
                    "17",
                    "19",
                    "20"
                ],
                correct: "17"
            },
            {
                question:
                    "What is 18²?",
                answers: [
                    "314",
                    "324",
                    "334",
                    "344"
                ],
                correct: "324"
            },
            {
                question:
                    "What is 3/4 of 80?",
                answers: [
                    "50",
                    "60",
                    "70",
                    "75"
                ],
                correct: "60"
            }
        ],

        hard: [
            {
                question:
                    "What is 17² + 8²?",
                answers: [
                    "329",
                    "353",
                    "351",
                    "357"
                ],
                correct: "353"
            },
            {
                question:
                    "If 3x + 7 = 28, what is x?",
                answers: [
                    "5",
                    "6",
                    "7",
                    "8"
                ],
                correct: "7"
            },
            {
                question:
                    "What is 15% of 360?",
                answers: [
                    "45",
                    "54",
                    "60",
                    "72"
                ],
                correct: "54"
            },
            {
                question:
                    "What is the square root of 625?",
                answers: [
                    "20",
                    "25",
                    "30",
                    "35"
                ],
                correct: "25"
            },
            {
                question:
                    "If 2x² = 50, what is the positive value of x?",
                answers: [
                    "4",
                    "5",
                    "6",
                    "7"
                ],
                correct: "5"
            }
        ]
    }
};

let gameState = {
    playerName: "",
    category: "",
    difficulty: "",
    questions: [],
    currentQuestion: 0,
    score: 0,
    xp: 0,
    lives: 3,
    combo: 0,
    bestCombo: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    time: 15,
    timer: null
};

const categoryNames = {
    public:
        "PUBLIC INFORMATION",
    proverbs:
        "EGYPTIAN PROVERBS",
    math:
        "MATH CHALLENGE"
};

const difficultySettings = {
    easy: {
        time: 15,
        points: 100,
        xp: 50
    },
    medium: {
        time: 12,
        points: 150,
        xp: 75
    },
    hard: {
        time: 9,
        points: 250,
        xp: 100
    }
};

startBtn.addEventListener(
    "click",
    function() {
        const name =
            playerNameInput.value.trim();

        if (name === "") {
            playerNameInput.classList.add(
                "is-invalid"
            );
            return;
        }

        playerNameInput.classList.remove(
            "is-invalid"
        );

        gameState.playerName =
            name;

        displayName.textContent =
            name;

        startScreen.classList.remove(
            "active"
        );

        arenaScreen.classList.add(
            "active"
        );

        playSound(
            backgroundSound
        );
    }
);

playerNameInput.addEventListener(
    "keydown",
    function(event) {
        if (event.key === "Enter") {
            startBtn.click();
        }
    }
);

const difficultyButtons =
    document.querySelectorAll(
        ".difficulty-btn"
    );

difficultyButtons.forEach(
    button => {
        button.addEventListener(
            "click",
            function() {
                const category =
                    this.dataset.category;

                const difficulty =
                    this.dataset.difficulty;

                startGame(
                    category,
                    difficulty
                );
            }
        );
    }
);

function startGame(
    category,
    difficulty
) {
    gameState.category =
        category;

    gameState.difficulty =
        difficulty;

    gameState.questions =
        [...questionBank[category][difficulty]];

    shuffleArray(
        gameState.questions
    );

    resetGame();

    categoryDisplay.textContent =
        categoryNames[category];

    totalQuestionsElement.textContent =
        gameState.questions.length;

    difficultyBadge.textContent =
        difficulty.toUpperCase();

    updateDifficultyBadge();

    arenaScreen.classList.remove(
        "active"
    );

    gameScreen.classList.add(
        "active"
    );

    loadQuestion();
}

function resetGame() {
    clearInterval(
        gameState.timer
    );

    gameState.currentQuestion =
        0;

    gameState.score =
        0;

    gameState.xp =
        0;

    gameState.lives =
        3;

    gameState.combo =
        0;

    gameState.bestCombo =
        0;

    gameState.correctAnswers =
        0;

    gameState.wrongAnswers =
        0;

    updateUI();
}

function loadQuestion() {
    clearInterval(
        gameState.timer
    );

    if (
        gameState.currentQuestion >=
        gameState.questions.length
    ) {
        finishGame();
        return;
    }

    if (
        gameState.lives <= 0
    ) {
        finishGame();
        return;
    }

    const question =
        gameState.questions[
            gameState.currentQuestion
        ];

    currentQuestionElement.textContent =
        gameState.currentQuestion + 1;

    questionProgress.style.width =
        `${
            (
                (gameState.currentQuestion + 1)
                /
                gameState.questions.length
            ) * 100
        }%`;

    challengeContainer.innerHTML =
        "";

    const header =
        document.createElement("div");

    header.className =
        "challenge-header";

    if (
        gameState.category ===
        "proverbs"
    ) {
        header.innerHTML = `
            <div class="challenge-type">
                EGYPTIAN PROVERB
            </div>
            <div class="proverb-emoji">
                ${question.emoji}
            </div>
            <h2 class="challenge-question">
                ${question.question}
            </h2>
        `;
    } else {
        header.innerHTML = `
            <div class="challenge-type">
                ${categoryNames[gameState.category]}
            </div>
            <h2 class="challenge-question">
                ${question.question}
            </h2>
        `;
    }

    challengeContainer.appendChild(
        header
    );

    const answers =
        document.createElement(
            "div"
        );

    answers.className =
        "answers";

    question.answers.forEach(
        answer => {
            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "answer-btn btn";

            button.textContent =
                answer;

            button.addEventListener(
                "click",
                function() {
                    checkAnswer(
                        button,
                        answer,
                        question.correct
                    );
                }
            );

            answers.appendChild(
                button
            );
        }
    );

    challengeContainer.appendChild(
        answers
    );

    startTimer();

    updateUI();
}

function startTimer() {
    const settings =
        difficultySettings[
            gameState.difficulty
        ];

    gameState.time =
        settings.time;

    timerElement.textContent =
        gameState.time;

    timerCircle.classList.remove(
        "warning"
    );

    gameState.timer =
        setInterval(
            function() {
                gameState.time--;

                timerElement.textContent =
                    gameState.time;

                if (
                    gameState.time <= 3
                ) {
                    timerCircle.classList.add(
                        "warning"
                    );
                }

                if (
                    gameState.time <= 0
                ) {
                    clearInterval(
                        gameState.timer
                    );

                    timeOut();
                }
            },
            1000
        );
}

function timeOut() {
    gameState.wrongAnswers++;

    gameState.combo = 0;

    gameState.lives--;

    feedbackElement.textContent =
        "⏰ TIME OUT!";

    feedbackElement.style.color =
        "#ff4775";

    disableAnswerButtons();

    showCorrectAnswer();

    updateUI();

    setTimeout(
        nextQuestion,
        1200
    );
}

function checkAnswer(
    button,
    selectedAnswer,
    correctAnswer
) {
    clearInterval(
        gameState.timer
    );

    disableAnswerButtons();

    if (
        selectedAnswer ===
        correctAnswer
    ) {
        handleCorrect(
            button
        );
    } else {
        handleWrong(
            button,
            correctAnswer
        );
    }

    updateUI();

    setTimeout(
        nextQuestion,
        1200
    );
}

function handleCorrect(button) {
    button.classList.add(
        "correct"
    );

    gameState.correctAnswers++;

    gameState.combo++;

    if (
        gameState.combo >
        gameState.bestCombo
    ) {
        gameState.bestCombo =
            gameState.combo;
    }

    const settings =
        difficultySettings[
            gameState.difficulty
        ];

    let points =
        settings.points;

    if (
        gameState.combo >= 3
    ) {
        points += 50;
    }

    if (
        gameState.combo >= 5
    ) {
        points += 100;
    }

    gameState.score +=
        points;

    gameState.xp +=
        settings.xp;

    feedbackElement.textContent =
        `🔥 CORRECT! +${points}`;

    feedbackElement.style.color =
        "#36ff9b";
}

function handleWrong(
    button,
    correctAnswer
) {
    button.classList.add(
        "wrong"
    );

    gameState.wrongAnswers++;

    gameState.combo = 0;

    gameState.lives--;

    feedbackElement.textContent =
        "❌ WRONG ANSWER";

    feedbackElement.style.color =
        "#ff4775";

    showCorrectAnswer(
        correctAnswer
    );
}

function disableAnswerButtons() {
    const buttons =
        document.querySelectorAll(
            ".answer-btn"
        );

    buttons.forEach(
        button => {
            button.disabled =
                true;
        }
    );
}

function showCorrectAnswer(
    correctAnswer = null
) {
    const question =
        gameState.questions[
            gameState.currentQuestion
        ];

    const answer =
        correctAnswer ||
        question.correct;

    const buttons =
        document.querySelectorAll(
            ".answer-btn"
        );

    buttons.forEach(
        button => {
            if (
                button.textContent ===
                answer
            ) {
                button.classList.add(
                    "correct"
                );
            }
        }
    );
}

function nextQuestion() {
    feedbackElement.textContent =
        "";

    gameState.currentQuestion++;

    loadQuestion();
}

function updateUI() {
    scoreElement.textContent =
        gameState.score;

    xpElement.textContent =
        gameState.xp;

    comboElement.textContent =
        `x${gameState.combo}`;

    livesElement.textContent =
        "❤️".repeat(
            Math.max(
                gameState.lives,
                0
            )
        );
}

function updateDifficultyBadge() {
    difficultyBadge.className =
        "difficulty-badge";

    if (
        gameState.difficulty ===
        "easy"
    ) {
        difficultyBadge.style.borderColor =
            "#24d98b";

        difficultyBadge.style.color =
            "#24d98b";

        difficultyBadge.style.background =
            "rgba(36,217,139,0.1)";
    }

    if (
        gameState.difficulty ===
        "medium"
    ) {
        difficultyBadge.style.borderColor =
            "#ffb52e";

        difficultyBadge.style.color =
            "#ffb52e";

        difficultyBadge.style.background =
            "rgba(255,181,46,0.1)";
    }

    if (
        gameState.difficulty ===
        "hard"
    ) {
        difficultyBadge.style.borderColor =
            "#ff4775";

        difficultyBadge.style.color =
            "#ff4775";

        difficultyBadge.style.background =
            "rgba(255,71,117,0.1)";
    }
}

function finishGame() {
    clearInterval(
        gameState.timer
    );

    gameScreen.classList.remove(
        "active"
    );

    resultScreen.classList.add(
        "active"
    );

    const total =
        gameState.correctAnswers +
        gameState.wrongAnswers;

    let accuracy = 0;

    if (total > 0) {
        accuracy =
            Math.round(
                (
                    gameState.correctAnswers /
                    total
                ) * 100
            );
    }

    // Stop the background music once the round is over
    backgroundSound.pause();
    backgroundSound.currentTime = 0;

    if (accuracy >= 50) {
        playSound(winnerSound);
        playSound(applauseSound);
    } else {
        playSound(gameoverSound);
    }

    const rank =
        calculateRank();

    finalScoreElement.textContent =
        gameState.score;

    accuracyElement.textContent =
        `${accuracy}%`;

    bestComboElement.textContent =
        gameState.bestCombo;

    finalXpElement.textContent =
        gameState.xp;

    rankElement.textContent =
        rank;

    resultCategory.textContent =
        categoryNames[
            gameState.category
        ];

    resultDifficulty.textContent =
        gameState.difficulty.toUpperCase();

    if (
        accuracy >= 90
    ) {
        resultTitle.textContent =
            "LEGENDARY PERFORMANCE";
    } else if (
        accuracy >= 75
    ) {
        resultTitle.textContent =
            "ELITE PERFORMANCE";
    } else if (
        accuracy >= 50
    ) {
        resultTitle.textContent =
            "GREAT JOB";
    } else {
        resultTitle.textContent =
            "KEEP TRAINING";
    }

    saveGameData();
}

function calculateRank() {
    const score =
        gameState.score;

    if (score >= 1100) {
        return "LEGEND";
    }

    if (score >= 800) {
        return "MASTER";
    }

    if (score >= 550) {
        return "ELITE";
    }

    if (score >= 300) {
        return "PRO";
    }

    if (score >= 150) {
        return "RECRUIT";
    }

    return "NOVICE";
}

function saveGameData() {
    const oldData =
        JSON.parse(
            localStorage.getItem(
                "brainArena"
            )
        ) || {
            bestScore: 0,
            gamesPlayed: 0,
            totalXP: 0
        };

    oldData.gamesPlayed++;

    oldData.totalXP +=
        gameState.xp;

    if (
        gameState.score >
        oldData.bestScore
    ) {
        oldData.bestScore =
            gameState.score;
    }

    localStorage.setItem(
        "brainArena",
        JSON.stringify(oldData)
    );
}

playAgainBtn.addEventListener(
    "click",
    function() {
        resultScreen.classList.remove(
            "active"
        );

        gameScreen.classList.add(
            "active"
        );

        startGame(
            gameState.category,
            gameState.difficulty
        );

        playSound(
            backgroundSound
        );
    }
);

changeArenaBtn.addEventListener(
    "click",
    function() {
        resultScreen.classList.remove(
            "active"
        );

        arenaScreen.classList.add(
            "active"
        );
    }
);

homeBtn.addEventListener(
    "click",
    function() {
        clearInterval(
            gameState.timer
        );

        resultScreen.classList.remove(
            "active"
        );

        gameScreen.classList.remove(
            "active"
        );

        arenaScreen.classList.remove(
            "active"
        );

        startScreen.classList.add(
            "active"
        );

        playerNameInput.value =
            "";

        playerNameInput.classList.remove(
            "is-invalid"
        );

        backgroundSound.pause();
        backgroundSound.currentTime = 0;
    }
);

function shuffleArray(array) {
    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }
}