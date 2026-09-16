const QUESTION_BANK = {
  technology: {
    easy: [
      { q: "Which language is used to style a web page?", options: ["HTML", "Python", "CSS", "Java"], correct: 2 },
      { q: "What does HTML stand for?", options: ["Hyper Trainer Marking Language", "HyperText Markup Language", "Hyperlink Text Markup Language", "Home Tool Markup Language"], correct: 1 },
      { q: "Which symbol starts a single line comment in JavaScript?", options: ["<!-- -->", "//", "#", "/* */"], correct: 1 },
      { q: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style System", "Computer Styled Sections", "Colorful Style Sheets"], correct: 0 },
      { q: "Which tag creates a hyperlink in HTML?", options: ["<link>", "<a>", "<href>", "<url>"], correct: 1 },
      { q: "Which of these is a JavaScript library?", options: ["Laravel", "React", "Django", "Rails"], correct: 1 },
      { q: "What is the file extension for JavaScript files?", options: [".js", ".java", ".jsx", ".script"], correct: 0 },
      { q: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Active Memory", "Run Application Memory"], correct: 1 }
    ],
    medium: [
      { q: "Which CSS property controls the space outside an element's border?", options: ["padding", "margin", "gap", "spacing"], correct: 1 },
      { q: "In Bootstrap, which class creates a grid row?", options: [".grid-row", ".row", ".container-row", ".flex-row"], correct: 1 },
      { q: "Which JavaScript method converts a JSON string into an object?", options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "Object.parse()"], correct: 1 },
      { q: "What does the 'let' keyword provide that 'var' doesn't?", options: ["Global scope", "Block scope", "No scope", "Function hoisting"], correct: 1 },
      { q: "Which HTTP method is typically used to update a resource?", options: ["GET", "PUT", "DELETE", "HEAD"], correct: 1 },
      { q: "What does the '===' operator check in JavaScript?", options: ["Value only", "Type only", "Value and type", "Reference only"], correct: 2 },
      { q: "Which CSS unit is relative to the root element's font size?", options: ["em", "vh", "rem", "%"], correct: 2 },
      { q: "What does API stand for?", options: ["Applied Program Interface", "Application Programming Interface", "Automatic Process Integration", "Advanced Protocol Instruction"], correct: 1 }
    ],
    hard: [
      { q: "What will typeof null return in JavaScript?", options: ["'null'", "'undefined'", "'object'", "'number'"], correct: 2 },
      { q: "What is a closure in JavaScript?", options: ["A loop that never ends", "A function bundled with its lexical scope", "A CSS animation type", "A database transaction"], correct: 1 },
      { q: "In CSS, what does z-index require to work?", options: ["display: flex", "a positioned element", "float", "overflow: hidden"], correct: 1 },
      { q: "Which of these describes event bubbling?", options: ["Events fire from parent to child", "Events fire from child to parent", "Events skip the DOM tree", "Events only fire once"], correct: 1 },
      { q: "What does 'idempotent' mean for an HTTP method like PUT?", options: ["It always fails on retry", "Repeating it has the same effect as doing it once", "It requires authentication", "It cannot be cached"], correct: 1 },
      { q: "Which storage survives closing the browser tab?", options: ["sessionStorage", "localStorage", "Both", "Neither"], correct: 1 }
    ],
    extreme: [
      { q: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], correct: 2 },
      { q: "In JavaScript, what is the result of 0.1 + 0.2 === 0.3?", options: ["true", "false", "NaN", "undefined"], correct: 1 },
      { q: "Which wins in CSS specificity: an inline style or an ID selector?", options: ["ID selector", "Inline style", "They tie", "Neither applies"], correct: 1 },
      { q: "The CAP theorem says a distributed system can guarantee at most two of what?", options: ["Cost, Access, Performance", "Consistency, Availability, Partition tolerance", "Caching, API, Persistence", "Concurrency, Atomicity, Portability"], correct: 1 },
      { q: "Which sorting algorithm has O(n log n) average time complexity?", options: ["Bubble sort", "Insertion sort", "Merge sort", "Selection sort"], correct: 2 },
      { q: "What does the JavaScript event loop process after the call stack empties?", options: ["The render tree", "The microtask queue", "The garbage collector", "The DOM parser"], correct: 1 }
    ]
  },

  science: {
    easy: [
      { q: "What is H2O commonly known as?", options: ["Salt", "Water", "Oxygen", "Hydrogen"], correct: 1 },
      { q: "Which force pulls objects toward the Earth?", options: ["Magnetism", "Friction", "Gravity", "Tension"], correct: 2 },
      { q: "How many bones are in the adult human body?", options: ["186", "206", "226", "246"], correct: 1 },
      { q: "Which organ pumps blood through the human body?", options: ["Lungs", "Liver", "Heart", "Kidney"], correct: 2 },
      { q: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Saturn", "Mars"], correct: 1 }
    ],
    medium: [
      { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correct: 2 },
      { q: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Oxygen", "Carbon"], correct: 1 },
      { q: "What type of energy is stored in a stretched rubber band?", options: ["Kinetic", "Potential", "Thermal", "Chemical"], correct: 1 },
      { q: "Which gas do plants absorb for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2 },
      { q: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 }
    ],
    hard: [
      { q: "What is the process by which plants make their own food?", options: ["Respiration", "Photosynthesis", "Transpiration", "Fermentation"], correct: 1 },
      { q: "Which particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Positron"], correct: 2 },
      { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
      { q: "Which planet has the most moons in our solar system?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1 }
    ],
    extreme: [
      { q: "What is the Heisenberg Uncertainty Principle about?", options: ["Gravity and mass", "Position and momentum of particles", "Speed of light limits", "Chemical reaction rates"], correct: 1 },
      { q: "Which particle was confirmed at CERN in 2012?", options: ["Neutrino", "Higgs boson", "Quark", "Muon"], correct: 1 },
      { q: "What is the speed of light approximately, in km/s?", options: ["150,000", "300,000", "450,000", "600,000"], correct: 1 },
      { q: "What is the rarest blood type in humans?", options: ["O negative", "AB negative", "B negative", "A negative"], correct: 1 }
    ]
  },

  movies: {
    easy: [
      { q: "Which animated film features a snowman named Olaf?", options: ["Moana", "Frozen", "Tangled", "Brave"], correct: 1 },
      { q: "In which film would you find the character Simba?", options: ["The Jungle Book", "The Lion King", "Madagascar", "Zootopia"], correct: 1 },
      { q: "What is the name of the wizarding school in Harry Potter?", options: ["Durmstrang", "Hogwarts", "Beauxbatons", "Ilvermorny"], correct: 1 },
      { q: "Which superhero is known as the Dark Knight?", options: ["Superman", "Batman", "Iron Man", "Spider-Man"], correct: 1 },
      { q: "Which film series features a ring that must be destroyed?", options: ["Narnia", "The Lord of the Rings", "Eragon", "Percy Jackson"], correct: 1 }
    ],
    medium: [
      { q: "Who directed the film Inception?", options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Ridley Scott"], correct: 1 },
      { q: "Which film won the Academy Award for Best Picture in 1995?", options: ["Pulp Fiction", "Forrest Gump", "The Shawshank Redemption", "Speed"], correct: 1 },
      { q: "In The Matrix, which pill does Neo take?", options: ["Blue", "Red", "Green", "Neither"], correct: 1 },
      { q: "Which studio produced Toy Story?", options: ["DreamWorks", "Pixar", "Illumination", "Blue Sky"], correct: 1 },
      { q: "Who played Jack in Titanic?", options: ["Brad Pitt", "Leonardo DiCaprio", "Matt Damon", "Johnny Depp"], correct: 1 }
    ],
    hard: [
      { q: "Which film was the first to win the Best Picture Oscar?", options: ["Wings", "Sunrise", "The Jazz Singer", "Metropolis"], correct: 0 },
      { q: "Who directed Parasite, the 2020 Best Picture winner?", options: ["Park Chan-wook", "Bong Joon-ho", "Kim Ki-duk", "Lee Chang-dong"], correct: 1 },
      { q: "Which actor has won the most Best Actor Oscars?", options: ["Jack Nicholson", "Daniel Day-Lewis", "Tom Hanks", "Marlon Brando"], correct: 1 },
      { q: "In Star Wars, what is the name of Han Solo's ship?", options: ["Star Destroyer", "Millennium Falcon", "Slave I", "X-Wing"], correct: 1 }
    ],
    extreme: [
      { q: "Which 1927 German film is a landmark of science fiction cinema?", options: ["Nosferatu", "Metropolis", "The Cabinet of Dr. Caligari", "M"], correct: 1 },
      { q: "Which director is famous for the opening long take in Touch of Evil?", options: ["Alfred Hitchcock", "Orson Welles", "Fritz Lang", "Billy Wilder"], correct: 1 },
      { q: "Which country produces the most films per year?", options: ["United States", "India", "China", "Nigeria"], correct: 1 }
    ]
  },

  sports: {
    easy: [
      { q: "How many players from one team are on a football pitch?", options: ["9", "10", "11", "12"], correct: 2 },
      { q: "In which sport would you use a racket and a shuttlecock?", options: ["Tennis", "Badminton", "Squash", "Table tennis"], correct: 1 },
      { q: "How many rings are on the Olympic flag?", options: ["4", "5", "6", "7"], correct: 1 },
      { q: "How many points is a touchdown worth in American football?", options: ["3", "6", "7", "8"], correct: 1 },
      { q: "In basketball, how many points is a free throw worth?", options: ["1", "2", "3", "4"], correct: 0 }
    ],
    medium: [
      { q: "Which country has won the most FIFA World Cup titles?", options: ["Germany", "Brazil", "Italy", "Argentina"], correct: 1 },
      { q: "How often are the Summer Olympic Games held?", options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], correct: 2 },
      { q: "In tennis, what is a score of zero called?", options: ["Nil", "Love", "Duck", "Blank"], correct: 1 },
      { q: "Which sport is played at Wimbledon?", options: ["Cricket", "Tennis", "Golf", "Rugby"], correct: 1 },
      { q: "How long is a marathon, roughly?", options: ["21 km", "32 km", "42 km", "50 km"], correct: 2 }
    ],
    hard: [
      { q: "Which country hosted the 2016 Summer Olympics?", options: ["China", "Brazil", "United Kingdom", "Japan"], correct: 1 },
      { q: "In cricket, how many balls are in a standard over?", options: ["4", "5", "6", "8"], correct: 2 },
      { q: "Which club has won the most UEFA Champions League titles?", options: ["AC Milan", "Real Madrid", "Bayern Munich", "Liverpool"], correct: 1 },
      { q: "In Formula 1, which flag signals the end of a race?", options: ["Red", "Chequered", "Yellow", "Blue"], correct: 1 }
    ],
    extreme: [
      { q: "Who holds the men's 100m world record?", options: ["Tyson Gay", "Usain Bolt", "Yohan Blake", "Asafa Powell"], correct: 1 },
      { q: "In which year were the first modern Olympic Games held?", options: ["1886", "1896", "1900", "1912"], correct: 1 },
      { q: "Which country is the origin of the sport of judo?", options: ["China", "Japan", "Korea", "Thailand"], correct: 1 }
    ]
  },

  music: {
    easy: [
      { q: "How many strings does a standard guitar have?", options: ["4", "5", "6", "7"], correct: 2 },
      { q: "Which instrument has black and white keys?", options: ["Violin", "Piano", "Flute", "Drums"], correct: 1 },
      { q: "How many lines are there in a musical staff?", options: ["3", "4", "5", "6"], correct: 2 },
      { q: "Which band released the album Abbey Road?", options: ["The Rolling Stones", "The Beatles", "Pink Floyd", "Queen"], correct: 1 },
      { q: "What does a drummer usually keep for the band?", options: ["The melody", "The tempo", "The lyrics", "The harmony"], correct: 1 }
    ],
    medium: [
      { q: "Which singer is known as the King of Pop?", options: ["Elvis Presley", "Michael Jackson", "Prince", "Freddie Mercury"], correct: 1 },
      { q: "How many notes are in a chromatic scale?", options: ["7", "8", "12", "14"], correct: 2 },
      { q: "Which instrument family does the trumpet belong to?", options: ["Woodwind", "Brass", "Percussion", "Strings"], correct: 1 },
      { q: "Which country is the origin of reggae music?", options: ["Cuba", "Jamaica", "Brazil", "Trinidad"], correct: 1 },
      { q: "What does 'forte' mean in music notation?", options: ["Soft", "Loud", "Fast", "Slow"], correct: 1 }
    ],
    hard: [
      { q: "Who composed The Four Seasons?", options: ["Bach", "Vivaldi", "Mozart", "Handel"], correct: 1 },
      { q: "Which composer continued writing music after going deaf?", options: ["Chopin", "Beethoven", "Schubert", "Brahms"], correct: 1 },
      { q: "How many symphonies did Beethoven complete?", options: ["7", "9", "11", "12"], correct: 1 },
      { q: "What is the Italian term for gradually getting louder?", options: ["Diminuendo", "Crescendo", "Staccato", "Legato"], correct: 1 }
    ],
    extreme: [
      { q: "How many semitones are in a perfect fifth?", options: ["5", "6", "7", "8"], correct: 2 },
      { q: "Which time signature is known as common time?", options: ["3/4", "4/4", "6/8", "2/2"], correct: 1 },
      { q: "Which composer wrote the opera The Magic Flute?", options: ["Verdi", "Mozart", "Wagner", "Puccini"], correct: 1 }
    ]
  },

  general: {
    easy: [
      { q: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correct: 2 },
      { q: "How many days are there in a leap year?", options: ["364", "365", "366", "367"], correct: 2 },
      { q: "What colour do you get by mixing blue and yellow?", options: ["Purple", "Orange", "Green", "Pink"], correct: 2 },
      { q: "What is the capital of France?", options: ["Lyon", "Paris", "Marseille", "Nice"], correct: 1 },
      { q: "Which is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 }
    ],
    medium: [
      { q: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Claude Monet"], correct: 1 },
      { q: "Which country is home to the Great Barrier Reef?", options: ["Brazil", "Australia", "Mexico", "Indonesia"], correct: 1 },
      { q: "What is the capital city of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], correct: 2 },
      { q: "Mount Everest is located in which mountain range?", options: ["Andes", "Alps", "Himalayas", "Rockies"], correct: 2 },
      { q: "The Great Pyramid of Giza was built for which pharaoh?", options: ["Tutankhamun", "Khufu", "Ramesses II", "Akhenaten"], correct: 1 }
    ],
    hard: [
      { q: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
      { q: "What is the longest river in the world?", options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"], correct: 1 },
      { q: "Which African country was formerly known as Abyssinia?", options: ["Kenya", "Ethiopia", "Sudan", "Somalia"], correct: 1 },
      { q: "In which year did the Berlin Wall fall?", options: ["1987", "1989", "1991", "1993"], correct: 1 },
      { q: "Which strait separates Europe and Africa?", options: ["Strait of Hormuz", "Strait of Gibraltar", "Bosphorus Strait", "Bering Strait"], correct: 1 }
    ],
    extreme: [
      { q: "Which country has the most time zones?", options: ["Russia", "USA", "France", "China"], correct: 2 },
      { q: "Which is the only sea with no coastline?", options: ["Red Sea", "Sargasso Sea", "Caspian Sea", "Dead Sea"], correct: 1 },
      { q: "The Treaty of Westphalia (1648) is considered the origin of what concept?", options: ["Modern banking", "Nation-state sovereignty", "Democracy", "The Olympic Games"], correct: 1 },
      { q: "Which desert is the largest in the world?", options: ["Sahara", "Gobi", "Antarctic", "Kalahari"], correct: 2 }
    ]
  }
};

const DIFFICULTY_TIME = { easy: 20, medium: 15, hard: 10, extreme: 7 };
const RING_CIRC = 2 * Math.PI * 52;
const DEFAULT_CATEGORY = "technology";
const DEFAULT_DIFFICULTY = "easy";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

if (!currentUser) {
  window.location.href = "index.html";
}

const state = {
  category: DEFAULT_CATEGORY,
  difficulty: DEFAULT_DIFFICULTY,
  count: 10,
  questions: [],
  currentIndex: 0,
  score: 0,
  answers: [],
  timer: null,
  timeLeft: 15,
  locked: false,
  finished: false
};

function $(id) {
  return document.getElementById(id);
}

function getUserName() {
  return currentUser && currentUser.name ? currentUser.name : "Player";
}

function getUserEmail() {
  return currentUser && currentUser.email ? currentUser.email : "guest";
}

function getAllResults() {
  try {
    const stored = JSON.parse(localStorage.getItem("quizResults"));
    return Array.isArray(stored) ? stored : [];
  } catch (e) {
    return [];
  }
}

function saveResult(result) {
  const all = getAllResults();
  all.push(result);
  localStorage.setItem("quizResults", JSON.stringify(all));

  const mine = all.filter(r => r.userEmail === result.userEmail);
  const bestScore = mine.reduce((best, r) => Math.max(best, r.score), 0);

  return { bestScore: bestScore, totalPlayed: mine.length };
}

function readSetup() {
  let setup = null;
  try {
    setup = JSON.parse(sessionStorage.getItem("quizSetup"));
  } catch (e) {
    setup = null;
  }

  if (!setup || !setup.category || !setup.difficulty) return null;

  const rawCount = parseInt(setup.count || setup.totalQuestions, 10);

  return {
    category: QUESTION_BANK[setup.category] ? setup.category : DEFAULT_CATEGORY,
    difficulty: DIFFICULTY_TIME[setup.difficulty] ? setup.difficulty : DEFAULT_DIFFICULTY,
    count: isNaN(rawCount) ? 10 : Math.min(Math.max(rawCount, 3), 20)
  };
}

function syncOverlayControls() {
  document.querySelectorAll("#categoryChips .chip").forEach(c => {
    c.classList.toggle("active", c.dataset.cat === state.category);
  });
  document.querySelectorAll("#difficultyChips .chip").forEach(c => {
    c.classList.toggle("active", c.dataset.diff === state.difficulty);
  });

  const range = $("qCountRange");
  const rangeLabel = $("qCountLabel");
  if (range) range.value = state.count;
  if (rangeLabel) rangeLabel.textContent = state.count;
}

function initSetupOverlay() {
  const overlay = $("setupOverlay");
  const range = $("qCountRange");
  const rangeLabel = $("qCountLabel");

  document.querySelectorAll("#categoryChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#categoryChips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.category = chip.dataset.cat;
    });
  });

  document.querySelectorAll("#difficultyChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#difficultyChips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.difficulty = chip.dataset.diff;
    });
  });

  if (range && rangeLabel) {
    range.addEventListener("input", () => {
      rangeLabel.textContent = range.value;
      state.count = parseInt(range.value, 10);
    });
  }

  $("startQuizBtn").addEventListener("click", () => {
    const activeCat = document.querySelector("#categoryChips .chip.active");
    const activeDiff = document.querySelector("#difficultyChips .chip.active");
    if (activeCat) state.category = activeCat.dataset.cat;
    if (activeDiff) state.difficulty = activeDiff.dataset.diff;
    if (range) state.count = parseInt(range.value, 10);

    overlay.classList.add("hidden");
    startQuiz();
  });

  const setup = readSetup();

  if (setup) {
    sessionStorage.removeItem("quizSetup");
    state.category = setup.category;
    state.difficulty = setup.difficulty;
    state.count = setup.count;
    syncOverlayControls();
    overlay.classList.add("hidden");
    startQuiz();
  } else {
    syncOverlayControls();
    overlay.classList.remove("hidden");
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestionSet() {
  const bank = QUESTION_BANK[state.category] || QUESTION_BANK[DEFAULT_CATEGORY];
  let pool = shuffle(bank[state.difficulty] || []);

  if (pool.length < state.count) {
    const others = Object.keys(bank)
      .filter(d => d !== state.difficulty)
      .flatMap(d => bank[d]);
    pool = pool.concat(shuffle(others));
  }

  if (pool.length === 0) {
    pool = shuffle(Object.values(QUESTION_BANK[DEFAULT_CATEGORY]).flat());
  }

  return pool.slice(0, state.count).map(q => {
    const optionObjs = q.options.map((text, i) => ({ text: text, wasCorrect: i === q.correct }));
    const shuffledOpts = shuffle(optionObjs);
    return {
      text: q.q,
      options: shuffledOpts.map(o => o.text),
      correct: shuffledOpts.findIndex(o => o.wasCorrect)
    };
  });
}

function startQuiz() {
  state.questions = buildQuestionSet();

  if (state.questions.length === 0) {
    alert("No questions are available for this category yet.");
    window.location.href = "categories.html";
    return;
  }

  state.currentIndex = 0;
  state.score = 0;
  state.finished = false;
  state.answers = new Array(state.questions.length).fill(null);

  $("qTotal").textContent = state.questions.length;
  $("levelText").textContent = state.difficulty.toUpperCase();
  $("scoreNum").textContent = "0";
  $("resultsOverlay").classList.add("hidden");
  $("quizStage").classList.add("active");

  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.currentIndex];
  const prevAnswer = state.answers[state.currentIndex];
  const letters = ["A", "B", "C", "D"];

  $("qNum").textContent = String(state.currentIndex + 1).padStart(2, "0");
  $("qIndex").textContent = state.currentIndex + 1;
  $("questionText").textContent = q.text;
  $("scoreNum").textContent = state.score;
  $("progressFill").style.width = (state.currentIndex / state.questions.length) * 100 + "%";

  const grid = $("answersGrid");
  grid.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("div");
    btn.className = "answer-btn";
    btn.innerHTML = '<span class="answer-letter">' + letters[i] + '</span><span class="answer-text"></span>';
    btn.querySelector(".answer-text").textContent = opt;
    btn.addEventListener("click", () => handleAnswer(i));
    grid.appendChild(btn);
  });

  if (prevAnswer) {
    state.locked = true;
    stopTimer();
    $("timerNum").textContent = "-";
    lockAnswers(prevAnswer.selected, q.correct);
  } else {
    state.locked = false;
    startTimer(DIFFICULTY_TIME[state.difficulty] || 15);
  }

  $("prevBtn").classList.toggle("disabled", state.currentIndex === 0);
  const isLast = state.currentIndex === state.questions.length - 1;
  $("nextBtn").querySelector(".hex-label").textContent = isLast ? "Finish" : "Next";
}

function stopTimer() {
  clearInterval(state.timer);
  state.timer = null;
  const wrapper = document.querySelector(".timer-ring");
  if (wrapper) wrapper.classList.remove("urgent");
}

function startTimer(seconds) {
  stopTimer();
  state.timeLeft = seconds;

  const ring = $("ringFg");
  const numEl = $("timerNum");

  ring.style.strokeDasharray = RING_CIRC;
  ring.style.strokeDashoffset = 0;
  numEl.textContent = seconds;

  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    numEl.textContent = Math.max(state.timeLeft, 0);
    ring.style.strokeDashoffset = RING_CIRC * (1 - state.timeLeft / seconds);

    if (state.timeLeft <= 5) {
      const wrapper = document.querySelector(".timer-ring");
      if (wrapper) wrapper.classList.add("urgent");
    }

    if (state.timeLeft <= 0) {
      stopTimer();
      if (!state.locked) handleAnswer(-1);
    }
  }, 1000);
}

function handleAnswer(selectedIndex) {
  if (state.locked) return;
  state.locked = true;
  stopTimer();

  const q = state.questions[state.currentIndex];
  const isCorrect = selectedIndex === q.correct;

  state.answers[state.currentIndex] = { selected: selectedIndex, isCorrect: isCorrect };
  if (isCorrect) state.score += 1;
  $("scoreNum").textContent = state.score;

  lockAnswers(selectedIndex, q.correct);

  if (isCorrect) {
    playCorrectSound();
    burstConfetti();
  } else {
    playWrongSound();
    triggerShake();
    triggerShards();
  }
}

function lockAnswers(selectedIndex, correctIndex) {
  document.querySelectorAll("#answersGrid .answer-btn").forEach((btn, i) => {
    btn.classList.add("disabled");
    if (i === correctIndex) btn.classList.add("correct");
    else if (i === selectedIndex) btn.classList.add("wrong");
    else btn.classList.add("faded");
  });
}

function goNext() {
  if (!state.locked) return;

  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function goPrev() {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
  }
}

function finishQuiz() {
  if (state.finished) return;
  state.finished = true;
  stopTimer();

  $("progressFill").style.width = "100%";

  const total = state.questions.length;
  const accuracy = Math.round((state.score / total) * 100);
  const name = getUserName();

  const stats = saveResult({
    userEmail: getUserEmail(),
    date: new Date().toISOString(),
    category: state.category,
    difficulty: state.difficulty,
    score: state.score,
    totalQuestions: total
  });

  $("resultsGreeting").textContent =
    accuracy >= 70 ? "Amazing, " + name + "!" :
      accuracy >= 40 ? "Nice try, " + name + "!" :
        "Keep going, " + name + "!";

  $("resultsMedal").textContent = accuracy >= 70 ? "🏆" : accuracy >= 40 ? "🎯" : "💪";
  $("finalScore").textContent = state.score;
  $("finalTotal").textContent = total;
  $("statAccuracy").textContent = accuracy + "%";
  $("statBest").textContent = stats.bestScore;
  $("statPlayed").textContent = stats.totalPlayed;

  $("resultsOverlay").classList.remove("hidden");
  if (accuracy >= 70) burstConfetti(1.6);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!currentUser) return;

  initSetupOverlay();

  $("prevBtn").addEventListener("click", goPrev);
  $("nextBtn").addEventListener("click", goNext);

  $("backBtn").addEventListener("click", e => {
    const inProgress = $("quizStage").classList.contains("active") && !state.finished;
    if (inProgress && !confirm("Leave this quiz? Your progress will be lost.")) {
      e.preventDefault();
      return;
    }
    stopTimer();
  });

  $("playAgainBtn").addEventListener("click", () => {
    stopTimer();
    sessionStorage.removeItem("quizSetup");
    $("resultsOverlay").classList.add("hidden");
    $("quizStage").classList.remove("active");
    syncOverlayControls();
    $("setupOverlay").classList.remove("hidden");
  });

  document.addEventListener("keydown", e => {
    if (!$("quizStage").classList.contains("active")) return;

    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();

    if (!state.locked && ["1", "2", "3", "4"].includes(e.key)) {
      const btns = document.querySelectorAll("#answersGrid .answer-btn");
      const idx = parseInt(e.key, 10) - 1;
      if (btns[idx]) btns[idx].click();
    }
  });
});

let audioCtx;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(freq, startTime, duration, type, gainPeak) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak || 0.18, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playCorrectSound() {
  const now = getAudioCtx().currentTime;
  playTone(523.25, now, 0.16, "triangle", 0.18);
  playTone(659.25, now + 0.12, 0.16, "triangle", 0.18);
  playTone(783.99, now + 0.24, 0.28, "triangle", 0.18);
}

function playWrongSound() {
  const now = getAudioCtx().currentTime;
  playTone(220, now, 0.22, "sawtooth", 0.15);
  playTone(160, now + 0.14, 0.3, "sawtooth", 0.15);
}

function triggerShake() {
  const stage = $("quizStage");
  const flash = $("fxFlash");

  stage.classList.remove("shake");
  void stage.offsetWidth;
  stage.classList.add("shake");

  flash.classList.remove("show");
  void flash.offsetWidth;
  flash.classList.add("show");

  setTimeout(() => stage.classList.remove("shake"), 420);
}

function triggerShards() {
  const container = $("fxShards");

  for (let i = 0; i < 14; i++) {
    const shard = document.createElement("div");
    shard.className = "shard";
    shard.style.left = 45 + Math.random() * 10 + "vw";
    shard.style.bottom = Math.random() * 30 + "vh";
    shard.style.animationDelay = Math.random() * 0.15 + "s";
    shard.style.background = Math.random() > 0.5
      ? "linear-gradient(135deg, #ff3b5c, #7b0a20)"
      : "linear-gradient(135deg, #ff8a00, #7b0a20)";
    container.appendChild(shard);
    setTimeout(() => shard.remove(), 1200);
  }
}

function burstConfetti(intensity) {
  const canvas = $("confettiCanvas");
  const ctx = canvas.getContext("2d");
  const scale = intensity || 1;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ff2fb0", "#ff8a00", "#7b2ff7", "#20e07a", "#ffd23f"];
  const particles = [];
  const count = Math.round(90 * scale);
  const originX = canvas.width / 2;
  const originY = canvas.height * 0.42;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 60 + Math.random() * 30
    });
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      if (p.life > p.maxLife) return;
      alive = true;
      p.vy += 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life += 1;

      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(frame);
}

window.addEventListener("resize", () => {
  const canvas = $("confettiCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
