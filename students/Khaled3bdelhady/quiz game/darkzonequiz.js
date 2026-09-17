
const params = new URLSearchParams(window.location.search);
const requestedLevel = (params.get("level") || "random").toLowerCase();

const cards = [...document.querySelectorAll(".question-card")];
const groups = {
  easy: cards.slice(0, 20),
  medium: cards.slice(20, 40),
  hard: cards.slice(40, 60)
};

let activeQuestions = [];
let currentIndex = 0;
let score = 0;
let timer = 24;
let timerId = null;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function setupQuestions() {
  if (requestedLevel === "random") {
    activeQuestions = shuffle(cards).slice(0, 20);
  } else {
    activeQuestions = groups[requestedLevel] || groups.easy;
  }

  cards.forEach(card => card.classList.remove("active"));
  activeQuestions.forEach((card, i) => {
    card.dataset.index = i + 1;
    card.querySelector(".question-index").textContent = String(i + 1).padStart(2, "0");
  });

  document.getElementById("total").textContent = activeQuestions.length;
  document.getElementById("sideMode").textContent = requestedLevel.toUpperCase();
  document.getElementById("difficultyLabel").textContent = requestedLevel.toUpperCase();

  showQuestion(0);
}

function showQuestion(index) {
  if (!activeQuestions.length) return;

  currentIndex = Math.max(0, Math.min(index, activeQuestions.length - 1));

  cards.forEach(card => card.classList.remove("active"));
  const card = activeQuestions[currentIndex];
  card.classList.add("active");

  document.getElementById("current").textContent = currentIndex + 1;
  document.getElementById("progressBar").style.width =
    `${((currentIndex + 1) / activeQuestions.length) * 100}%`;

  document.getElementById("previous").disabled = currentIndex === 0;
  document.getElementById("next").innerHTML =
    currentIndex === activeQuestions.length - 1
      ? 'FINISH <i class="bi bi-flag-fill"></i>'
      : 'NEXT <i class="bi bi-arrow-right"></i>';

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timer = 24;
  const timerEl = document.getElementById("timer");
  timerEl.textContent = timer;

  timerId = setInterval(() => {
    timer--;
    timerEl.textContent = timer;

    if (timer <= 0) {
      clearInterval(timerId);
      goNext();
    }
  }, 1000);
}

function goNext() {
  clearInterval(timerId);

  if (currentIndex < activeQuestions.length - 1) {
    showQuestion(currentIndex + 1);
  } else {
    const player = localStorage.getItem("playerName") || "PLAYER";
    alert(`${player.toUpperCase()} — DARK ZONE COMPLETE!\\n\\nScore: ${score}`);
  }
}

document.querySelectorAll(".challenge-done, .challenge-skip").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".question-card");

    card.querySelectorAll(".quiz-answer").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (btn.dataset.correct === "true" && !card.dataset.scored) {
      score += 10;
      card.dataset.scored = "true";
      document.getElementById("score").textContent = score;
    }
  });
});

document.getElementById("next").addEventListener("click", goNext);

document.getElementById("previous").addEventListener("click", () => {
  if (currentIndex > 0) showQuestion(currentIndex - 1);
});

const savedAvatar = localStorage.getItem("selectedAvatar") || "avatar-1.png.jpg";
const savedName = localStorage.getItem("playerName") || "SHADOW";
document.getElementById("topAvatar").src = savedAvatar;
document.getElementById("topName").textContent = savedName.toUpperCase();

setupQuestions();
