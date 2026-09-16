const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

if (!currentUser) {
    window.location.href = "index.html";
}

const categoryCards = document.querySelectorAll(".category-card");
const difficultyDropdown = document.getElementById("difficulty-select");
const countDropdown = document.getElementById("count-select");
const startQuizBtn = document.getElementById("start-quiz-btn");

let selectedCategory = null;

categoryCards.forEach(card => {
    card.addEventListener("click", () => {
        categoryCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedCategory = card.getAttribute("data-category");
    });
});

if (startQuizBtn) {
    startQuizBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const selectedDifficulty = difficultyDropdown ? difficultyDropdown.value : "";
        const selectedCount = countDropdown ? parseInt(countDropdown.value, 10) : 10;

        if (!selectedCategory) {
            alert("Please choose a category first!");
            return;
        }

        if (!selectedDifficulty) {
            alert("Please choose a difficulty level!");
            return;
        }

        const quizSetup = {
            category: selectedCategory,
            difficulty: selectedDifficulty,
            count: selectedCount
        };

        sessionStorage.setItem("quizSetup", JSON.stringify(quizSetup));
        window.location.href = "quiz.html";
    });
}
