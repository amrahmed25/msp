const students = [
  {
    id: "amr ahmed",
    name: "amr",
    image: "./students/amr ahmed/image/amr3.png",
    tasksPath: "./students/amr ahmed/Tasks/",
    assignments: [
      {
        title: "Task 1 — Portfolio Landing Page",
        folder: "./students/amr ahmed/Tasks/4th Task/",
        preview: "./students/amr ahmed/Tasks/4th Task/img/amr3.png",
        description: "A responsive personal portfolio landing page with a hero section, project grid, and contact form.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25"
      },
      {
        title: "Task 2— auto car",
        folder: "./students/amr ahmed/Tasks/3rd Task/",
        preview: "./students/amr ahmed/Tasks/3rd Task/img/amg.jpg",
        description: "Modern car showcase with responsive design.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25"
      },
      {
        title: "Task 3 — restaurant",
        folder: "./students/amr ahmed/Tasks/2nd Task/",
        preview: "./students/amr ahmed/Tasks/2nd Task/rest.png",
        description: "Modern restaurant website with menu and reservations.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25"
      },
      
      {
        title: "Task 4 — restaurant",
        folder: "./students/amr ahmed/Tasks/1stTask/",
        preview: "./students/amr ahmed/Tasks/1stTask/preview.jpeg",
        description: "Modern restaurant website with menu and reservations.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25"
      }
    ]
  }
];
if (typeof module !== "undefined" && module.exports) {
  module.exports = students;
}
