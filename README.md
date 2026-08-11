# Student Assignments Showcase

A static website — plain HTML, CSS, and vanilla JavaScript, no frameworks —
for browsing students and the coding assignments they've submitted. Built
to run as-is on GitHub Pages.

## What's in here

```text
student-assignments/
├── index.html          Home page: student grid + search
├── student.html         Individual student page (student.html?id=ahmed)
├── css/
│   └── style.css        All styling
├── js/
│   ├── data.js           ← the folder map. Edit this to add students/tasks.
│   ├── home.js           Renders the home page
│   └── student.js        Renders a student's page from the URL
├── students/
│   └── <Name>/
│       ├── img.jpg       Profile picture
│       └── Tasks/
│           └── taskN/    One folder per assignment
└── README.md
```

## ⚠️ About the sample data

No real student folders were provided when this site was generated, so
`js/data.js` currently ships with **three placeholder students** (Ahmed,
Mohamed, Sara) using the exact structure described in the brief, plus
placeholder profile images and placeholder `index.html` demo pages inside
each task folder. None of it is real — swap it out using the steps below.

## Adding a real student

1. Create their folder:
   ```text
   students/<Name>/img.jpg
   students/<Name>/Tasks/task1/  (their first project, with its own index.html)
   students/<Name>/Tasks/task2/
   ...
   ```
2. Open `js/data.js` and copy one of the existing student objects, then
   edit it:
   ```js
   {
     id: "khaled",                          // used in the URL: student.html?id=khaled
     name: "Khaled",
     image: "./students/Khaled/img.jpg",
     tasksPath: "./students/Khaled/Tasks/",
     assignments: [
       {
         title: "Task 1 — <what it is>",
         folder: "./students/Khaled/Tasks/task1/",
         preview: "./students/Khaled/Tasks/task1/preview.jpg", // optional
         description: "One or two sentences about the project.",
         technologies: ["HTML", "CSS", "JavaScript"],
         github: "https://github.com/<user>/<repo>"            // optional
       }
     ]
   }
   ```
3. Push the new object into the `students` array. That's the only file
   you need to touch — no other code changes required.

**Removing a student or task** is the same in reverse: delete their
object from `data.js` (the folder can stay or go; only what's listed in
`data.js` shows up on the site).

## How "Live Demo" works

Each task is treated as its own mini-project. If `students/<Name>/Tasks/
task1/index.html` exists, the **Live Demo** button opens it directly. If
a task needs a different entry point, set `liveDemo` explicitly on that
assignment object in `data.js` and it will be used instead of the default
`folder + "index.html"`.

## "View Code" button

Only shown when the assignment object has a non-empty `github` field.
Leave it out (or set it to `""`) to hide the button for a given task.

## Screenshots / previews

Set `preview` to a path (e.g. a `preview.jpg` you drop inside the task's
folder). If it's omitted, or the image fails to load, a clean placeholder
is shown automatically — nothing breaks.

## Running locally

Because the pages load `js/data.js` etc. as external scripts, open this
folder with a local static server rather than double-clicking `index.html`
(the `file://` protocol blocks some browsers from loading scripts):

```bash
# from inside student-assignments/
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo settings, enable **Pages** and point it at the branch/
   folder containing `index.html` (root, or `/docs` if you move it there).
3. Done — all paths in `data.js` are relative, so they resolve correctly
   whether the site is served from a custom domain or a
   `username.github.io/repo-name/` subpath.

## Features included

- Responsive grid on both pages, down to mobile
- Live client-side search on the home page (by student name)
- Hover animations on cards, respecting `prefers-reduced-motion`
- Broken-image fallback (profile photos and task previews) — shows
  initials or a placeholder icon instead of a broken image icon
- Empty states (no students yet, no assignments yet, no search results)
- 404 handling on `student.html` when the `id` in the URL doesn't match
  any student
