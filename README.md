<div align="center">

# MSP Student Assignments

### A centralized showcase for student projects and coding assignments

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_Platform-2563EB?style=for-the-badge)](https://msp-gamma.vercel.app)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/Vanilla_JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A lightweight platform developed for MSP to help organize students and showcase the projects they submit during training.

</div>

---

## 🎯 Project Purpose

MSP Student Assignments provides a central place to browse student profiles and explore their submitted coding assignments. It was built to make project submissions easier to review and present during a Front-End Development training program.

## ✨ Features

- Browse students through a responsive card grid.
- Search for students by name.
- Open a dedicated page for an individual student.
- Display each student's assignments with descriptions and technologies.
- Provide project previews when preview images are available.
- Offer links to live demos and source code when configured.
- Handle missing images, empty states, and unknown student IDs.
- Respect reduced-motion preferences for accessibility.

## 🧰 Tech Stack

- **HTML5** — semantic page structure
- **CSS3** — responsive styling and interactions
- **Vanilla JavaScript** — student data and dynamic rendering
- **Vercel** — deployment

The project intentionally uses no front-end framework or build step.

## 📁 Project Structure

```text
msp/
├── index.html             # Student listing and search
├── student.html           # Individual student page
├── css/
│   └── style.css          # Application styles
├── js/
│   ├── data.js            # Student and assignment data
│   ├── home.js            # Home page rendering and search
│   └── student.js         # Student details rendering
└── students/
    └── <StudentName>/
        ├── img.jpg
        └── Tasks/
            └── task1/
                └── index.html
```

## ➕ Add a Student

1. Create a folder under `students/` for the student.
2. Add their profile image and assignment folders.
3. Open `js/data.js` and add a student object to the students array.

Example:

```javascript
{
  id: "student-id",
  name: "Student Name",
  image: "./students/StudentName/img.jpg",
  tasksPath: "./students/StudentName/Tasks/",
  assignments: [
    {
      title: "Assignment Title",
      folder: "./students/StudentName/Tasks/task1/",
      description: "A short explanation of the assignment.",
      technologies: ["HTML", "CSS", "JavaScript"],
      github: "https://github.com/username/project"
    }
  ]
}
```

Each assignment can optionally include a `preview` image and a `liveDemo` URL. Check `js/data.js` for the exact data structure used by the current version.

## 🚀 Run Locally

Because the site loads external JavaScript files, use a local static server rather than opening the HTML file directly.

```bash
git clone https://github.com/amrahmed25/msp.git
cd msp
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## 🌐 Live Demo

**[Open MSP Student Assignments](https://msp-gamma.vercel.app)**

## 👨‍💻 Developer

Developed by **Amr Ahmed** during Front-End Development training for MSP.

[GitHub](https://github.com/amrahmed25) · [LinkedIn](https://linkedin.com/in/3mrahmed/)

---

<div align="center">
Made to make student work easier to browse, review, and share.
</div>
