// Light / Dark Mode
(() => {
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    const themeKey = "studentLifeTheme";

    function applyTheme(theme) {
        body.classList.toggle("light-mode", theme === "light");

        const icon = themeToggle?.querySelector("i");

        if (icon) {
            icon.classList.toggle("bi-sun-fill", theme === "dark");
            icon.classList.toggle("bi-moon-fill", theme === "light");
        }
    }

    const savedTheme = localStorage.getItem(themeKey) || "dark";
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const newTheme = body.classList.contains("light-mode")
                ? "dark"
                : "light";

            localStorage.setItem(themeKey, newTheme);
            applyTheme(newTheme);
        });
    }
})();


const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
}


document.querySelectorAll(".sidebar .side-cont").forEach(link => {
    const linkPage = link.getAttribute("href")?.split("/").pop();
    const currentPage = window.location.pathname.split("/").pop();

    const isSubjectsPage =
        linkPage === "subjects.html" &&
        currentPage === "subject_details.html";

    if (linkPage === currentPage || isSubjectsPage) {
        link.classList.add("active");
    } else {
        link.classList.remove("active");
    }
});
