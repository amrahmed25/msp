/**
 * home.js — Home page logic.
 * Renders the student grid from `students` (data.js) and wires up the
 * live search filter. No frameworks: plain DOM + template strings.
 */

(function () {
  const grid = document.getElementById("student-grid");
  const searchInput = document.getElementById("student-search");
  const totalStudentsEl = document.getElementById("stat-students");
  const totalTasksEl = document.getElementById("stat-tasks");

  const totalTaskCount = students.reduce(
    (sum, s) => sum + (s.assignments ? s.assignments.length : 0),
    0
  );

  if (totalStudentsEl) totalStudentsEl.textContent = students.length;
  if (totalTasksEl) totalTasksEl.textContent = totalTaskCount;

  function initials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function studentCardTemplate(student) {
    const count = student.assignments ? student.assignments.length : 0;
    const label = count === 1 ? "1 Assignment" : `${count} Assignments`;

    return `
      <article class="student-card" data-name="${escapeHtml(student.name.toLowerCase())}">
        <div class="student-card__photo-wrap">
          <img
            class="student-card__photo"
            src="${student.image}"
            alt="${escapeHtml(student.name)}"
            loading="lazy"
            onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'student-card__photo-fallback', textContent:'${initials(student.name)}'}))"
          />
        </div>
        <div class="student-card__body">
          <h3 class="student-card__name">${escapeHtml(student.name)}</h3>
          <p class="student-card__count"><strong>${count}</strong> ${count === 1 ? "task" : "tasks"} submitted</p>
          <a class="btn btn--primary btn--block" href="student.html?id=${encodeURIComponent(student.id)}">
            View Assignments →
          </a>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderStudents(list) {
    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p class="empty-state__glyph">— No matches —</p>
          <h3 class="empty-state__title">No students found</h3>
          <p class="empty-state__text">Try a different name, or clear the search to see everyone.</p>
        </div>
      `;
      return;
    }
    grid.innerHTML = list.map(studentCardTemplate).join("");
  }

  function applySearch() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = !query
      ? students
      : students.filter((s) => s.name.toLowerCase().includes(query));
    renderStudents(filtered);
  }

  if (!students.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p class="empty-state__glyph">— Empty —</p>
        <h3 class="empty-state__title">No students yet</h3>
        <p class="empty-state__text">Add a student folder and an entry in js/data.js to see them here.</p>
      </div>
    `;
  } else {
    renderStudents(students);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }
})();
