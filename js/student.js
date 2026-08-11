/**
 * student.js — Student page logic (student.html?id=...).
 * Reads `id` from the URL, finds the matching student in `students`
 * (data.js), and renders their profile + assignment cards. Falls back
 * to a "student not found" state if the id doesn't match anyone.
 */

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
    <div class="empty-state" style="margin-top:56px;">
      <p class="empty-state__glyph">— 404 —</p>
      <h3 class="empty-state__title">Student not found</h3>
      <p class="empty-state__text">
        ${id ? `No student matches the id "${escapeHtml(id)}".` : "No student id was given in the URL."}
        Check the link or head back to the full list.
      </p>
      <a class="btn btn--primary" href="index.html">← Back to Students</a>
    </div>
  `;
}

function profileTemplate(student) {
  const count = student.assignments ? student.assignments.length : 0;
  return `
    <header class="profile-header">
      <div class="profile-header__photo-wrap">
        <img
          class="profile-header__photo"
          src="${student.image}"
          alt="${escapeHtml(student.name)}"
          onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'profile-header__photo-fallback', textContent:'${initials(student.name)}'}))"
        />
      </div>
      <div>
        <h1 class="profile-header__name">${escapeHtml(student.name)}</h1>
        <p class="profile-header__count"><strong>${count}</strong> ${count === 1 ? "assignment" : "assignments"} on file</p>
      </div>
    </header>
  `;
}

function assignmentsTemplate(student) {
  const assignments = student.assignments || [];

  if (!assignments.length) {
    return `
      <div class="empty-state" style="margin-top:40px;">
        <p class="empty-state__glyph">— Empty —</p>
        <h3 class="empty-state__title">No assignments yet</h3>
        <p class="empty-state__text">Once tasks are added to this student's Tasks folder and listed in js/data.js, they'll show up here.</p>
      </div>
    `;
  }

  const cards = assignments.map(taskCardTemplate).join("");
  return `<section class="task-grid">${cards}</section>`;
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
         onerror="this.parentElement.innerHTML = ${JSON.stringify(previewFallbackHtml())}"
       />`
    : previewFallbackHtml();

  return `
    <article class="task-card">
      <span class="task-card__tab">TASK ${String(index + 1).padStart(2, "0")}</span>
      <div class="task-card__preview-wrap">${previewMarkup}</div>
      <div class="task-card__body">
        <h3 class="task-card__title">${escapeHtml(task.title)}</h3>
        ${task.description ? `<p class="task-card__desc">${escapeHtml(task.description)}</p>` : ""}
        ${tech ? `<div class="task-card__tech">${tech}</div>` : ""}
        <div class="task-card__actions">
          <a class="btn btn--primary" href="${liveDemo}" target="_blank" rel="noopener">Live Demo</a>
          ${hasGithub ? `<a class="btn btn--ghost" href="${task.github}" target="_blank" rel="noopener">View Code</a>` : ""}
        </div>
      </div>
    </article>
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
