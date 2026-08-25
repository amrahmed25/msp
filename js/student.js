
import students from "./data.js";

(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const main = document.getElementById("student-main");
  const student = students.find((s) => s.id === id);

  document.title = student
    ? `${student.name} — Student Assignments`
    : "Student not found — Student Assignments";

  if (!student) {
    main.innerHTML = notFoundTemplate(id);
    return;
  }

  main.innerHTML = profileTemplate(student) + assignmentsTemplate(student);
})();

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function notFoundTemplate(id) {
  return `
    <div class="empty-state text-center py-5 px-3 border rounded-3 mt-5">
      <p class="empty-state__glyph mb-2">— 404 —</p>
      <h3 class="empty-state__title h4 mb-2">Student not found</h3>
      <p class="empty-state__text mx-auto mb-4">
        ${id ? `No student matches the id "${escapeHtml(id)}".` : "No student id was given in the URL."}
        Check the link or head back to the full list.
      </p>
      <a class="btn btn-ledger-primary" href="index.html">← Back to Students</a>
    </div>
  `;
}

function profileTemplate(student) {
  const count = student.assignments ? student.assignments.length : 0;
  return `
    <header class="profile-header d-flex align-items-center gap-4 flex-wrap pt-5 pb-2">
      <div class="profile-header__photo-wrap rounded-circle overflow-hidden">
        <img
          class="profile-header__photo w-100 h-100"
          src="${student.image}"
          alt="${escapeHtml(student.name)}"
          onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'profile-header__photo-fallback', textContent:'${initials(student.name)}'}))"
        />
      </div>
      <div>
        <h1 class="profile-header__name mb-1">${escapeHtml(student.name)}</h1>
        <p class="profile-header__count mb-0"><strong>${count}</strong> ${count === 1 ? "assignment" : "assignments"} on file</p>
      </div>
    </header>
  `;
}

function assignmentsTemplate(student) {
  const assignments = student.assignments || [];

  if (!assignments.length) {
    return `
      <div class="empty-state text-center py-5 px-3 border rounded-3 mt-4">
        <p class="empty-state__glyph mb-2">— Empty —</p>
        <h3 class="empty-state__title h4 mb-2">No assignments yet</h3>
        <p class="empty-state__text mx-auto mb-0">Once tasks are added to this student's Tasks folder and listed in js/data.js, they'll show up here.</p>
      </div>
    `;
  }

  const cards = assignments.map(taskCardTemplate).join("");
  return `<section class="row g-4 task-grid mt-1">${cards}</section>`;
}

function taskCardTemplate(task, index) {
  const liveDemo = task.liveDemo || `${task.folder}index.html`;
  const hasGithub = task.github && task.github.trim().length > 0;
  const tech = (task.technologies || [])
    .map((t) => `<span class="tech-pill">${escapeHtml(t)}</span>`)
    .join("");

  const previewMarkup = task.preview
    ? `<img
         class="task-card__preview"
         src="${task.preview}"
         alt="${escapeHtml(task.title)} preview"
         loading="lazy"
       />`
    : previewFallbackHtml();

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="task-card card h-100 border overflow-hidden shadow-sm">
        <span class="task-card__tab">TASK ${String(index + 1).padStart(2, "0")}</span>
        <div class="task-card__preview-wrap">${previewMarkup}</div>
        <div class="card-body task-card__body d-flex flex-column">
          <h3 class="card-title task-card__title">${escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="card-text task-card__desc flex-grow-1">${escapeHtml(task.description)}</p>` : ""}
          ${tech ? `<div class="task-card__tech d-flex flex-wrap gap-2 mb-2">${tech}</div>` : ""}
          <div class="task-card__actions d-flex gap-2 mt-auto">
            <a class="btn btn-ledger-primary flex-fill" href="${liveDemo}" target="_blank" rel="noopener">Live Demo</a>
            ${hasGithub ? `<a class="btn btn-ledger-ghost flex-fill" href="${task.github}" target="_blank" rel="noopener">View Code</a>` : ""}
          </div>
        </div>
      </article>
    </div>
  `;
}

function previewFallbackHtml() {
  return `
    <div class="task-card__preview-fallback">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="14" rx="1.5"/>
        <path d="M3 15l4.5-4.5a1.5 1.5 0 0 1 2.12 0L14 15"/>
        <circle cx="16.5" cy="8.5" r="1.5"/>
      </svg>
      <span>No preview available</span>
    </div>
  `;
}