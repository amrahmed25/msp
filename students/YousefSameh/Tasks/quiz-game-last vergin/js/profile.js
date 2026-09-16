const CATEGORY_INFO = {
    technology: { label: "Technology", icon: "bi-code-slash" },
    science:    { label: "Science", icon: "bi-thermometer-half" },
    movies:     { label: "Movies", icon: "bi-film" },
    sports:     { label: "Sports", icon: "bi-flag-fill" },
    music:      { label: "Music", icon: "bi-music-note-beamed" },
    general:    { label: "General knowledge", icon: "bi-globe" }
};

function getCategoryInfo(categoryId) {
    return CATEGORY_INFO[categoryId] || { label: categoryId, icon: "bi-question-circle-fill" };
}

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

if (!currentUser) {
    window.location.href = "index.html";
} else {
    renderNavbar();
    renderProfile();
}

function renderNavbar() {
    document.getElementById("welcome-message").textContent = "Welcome, " + currentUser.name + "!";

    const navActions = document.getElementById("nav-actions");
    navActions.innerHTML = `
        <span class="user-greeting">Welcome, ${currentUser.name}</span>
        <a href="#" id="logout-btn" class="register-btn">Logout</a>
    `;

    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        sessionStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
}

function renderProfile() {
    document.getElementById("profile-name").textContent = currentUser.name;
    document.getElementById("profile-email").textContent = currentUser.email;

    const allResults = JSON.parse(localStorage.getItem("quizResults")) || [];
    const myResults = allResults.filter(r => r.userEmail === currentUser.email);

    renderStatCards(myResults);
    renderHistory(myResults);
}

function renderStatCards(results) {
    const totalQuizzes = results.length;

    document.getElementById("stat-total").textContent = totalQuizzes;

    if (totalQuizzes === 0) {
        document.getElementById("stat-average").textContent = "0%";
        document.getElementById("stat-best").textContent = "0%";
        document.getElementById("stat-questions").textContent = "0";
        return;
    }

    let totalPercentSum = 0;
    let bestPercent = 0;
    let totalQuestionsAnswered = 0;

    results.forEach(r => {
        const percent = Math.round((r.score / r.totalQuestions) * 100);
        totalPercentSum += percent;
        totalQuestionsAnswered += r.totalQuestions;
        if (percent > bestPercent) {
            bestPercent = percent;
        }
    });

    const averagePercent = Math.round(totalPercentSum / totalQuizzes);

    document.getElementById("stat-average").textContent = averagePercent + "%";
    document.getElementById("stat-best").textContent = bestPercent + "%";
    document.getElementById("stat-questions").textContent = totalQuestionsAnswered;
}

function renderHistory(results) {
    const historyList = document.getElementById("history-list");
    const emptyState = document.getElementById("empty-state");

    if (results.length === 0) {
        historyList.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    historyList.style.display = "flex";
    emptyState.style.display = "none";

    const sortedResults = [...results].sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = sortedResults.map(buildHistoryRow).join("");
}

function buildHistoryRow(result) {
    const info = getCategoryInfo(result.category);
    const percent = Math.round((result.score / result.totalQuestions) * 100);

    return `
        <div class="history-row">
            <div class="history-icon"><i class="bi ${info.icon}"></i></div>
            <div class="history-info">
                <span class="history-category">${info.label}</span>
                <span class="difficulty-badge difficulty-${result.difficulty}">${result.difficulty}</span>
                <div class="history-meta">${formatDate(result.date)}</div>
            </div>
            <div class="history-score">
                <span class="history-score-value">${result.score}/${result.totalQuestions}</span>
                <span class="history-score-percent">${percent}%</span>
            </div>
        </div>
    `;
}
