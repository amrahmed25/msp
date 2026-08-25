import students from "./data.js";

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
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <article class="student-card card h-100 border overflow-hidden shadow-sm" data-name="${escapeHtml(student.name.toLowerCase())}">
          <div class="student-card__photo-wrap">
            <img
              class="student-card__photo"
              src="${student.image}"
              alt="${escapeHtml(student.name)}"
              loading="lazy"
              onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'student-card__photo-fallback', textContent:'${initials(student.name)}'}))"
            />
          </div>
          <div class="card-body student-card__body d-flex flex-column">
            <h3 class="card-title student-card__name">${escapeHtml(student.name)}</h3>
            <p class="card-text student-card__count mb-3"><strong>${count}</strong> ${count === 1 ? "task" : "tasks"} submitted</p>
            <a class="btn btn-ledger-primary mt-auto" href="student.html?id=${encodeURIComponent(student.id)}">
              View Assignments →
            </a>
          </div>
        </article>
      </div>
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
        <div class="col-12">
          <div class="empty-state text-center py-5 px-3 border rounded-3">
            <p class="empty-state__glyph mb-2">— No matches —</p>
            <h3 class="empty-state__title h4 mb-2">No students found</h3>
            <p class="empty-state__text mx-auto mb-0">Try a different name, or clear the search to see everyone.</p>
          </div>
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
      <div class="col-12">
        <div class="empty-state text-center py-5 px-3 border rounded-3">
          <p class="empty-state__glyph mb-2">— Empty —</p>
          <h3 class="empty-state__title h4 mb-2">No students yet</h3>
          <p class="empty-state__text mx-auto mb-0">Add a student folder and an entry in js/data.js to see them here.</p>
        </div>
      </div>
    `;
  } else {
    renderStudents(students);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }
})();