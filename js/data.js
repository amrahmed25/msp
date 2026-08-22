const students = [
  {
    id: "amrAhmed",
    name: "amr",
    image: "./students/amr ahmed/image/amr3.png",
    tasksPath: "./students/amr ahmed/Tasks/",
    assignments: [
      {
        title: "Task 5 — Travel website",
        folder: "./students/amr ahmed/Tasks/5th Task/",
        preview: "./students/amr ahmed/Tasks/5th Task/images/bali.jpg",
        description: "A responsive website with a hero section, project grid, and contact form.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25/msp/tree/main/students/amr%20ahmed/Tasks/5th%20Task"
      },
      {
        title: "Task 4 — Portfolio Landing Page",
        folder: "./students/amr ahmed/Tasks/4th Task/",
        preview: "./students/amr ahmed/Tasks/4th Task/img/amr3.png",
        description: "A responsive personal portfolio landing page with a hero section, project grid, and contact form.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25/msp/tree/main/students/amr%20ahmed/Tasks/4th%20Task"
      },
      {
        title: "Task 3— auto car",
        folder: "./students/amr ahmed/Tasks/3rd Task/",
        preview: "./students/amr ahmed/Tasks/3rd Task/img/amg.jpg",
        description: "Modern car showcase with responsive design.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25/msp/tree/main/students/amr%20ahmed/Tasks/3rd%20Task"
      },
      {
        title: "Task 2 — restaurant",
        folder: "./students/amr ahmed/Tasks/2nd Task/",
        preview: "./students/amr ahmed/Tasks/2nd Task/rest.png",
        description: "Modern restaurant website with menu and reservations.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25/msp/tree/main/students/amr%20ahmed/Tasks/2nd%20Task"
      },
      
      {
        title: "Task 1 — restaurant",
        folder: "./students/amr ahmed/Tasks/1stTask/",
        preview: "./students/amr ahmed/Tasks/1stTask/preview.jpeg",
        description: "Modern restaurant website with menu and reservations.",
        technologies: ["HTML", "CSS", "JavaScript"],
        github: "https://github.com/amrahmed25/msp/tree/main/students/amr%20ahmed/Tasks/1st%20Task"
      }
    ]
  }
];
if (typeof module !== "undefined" && module.exports) {
  module.exports = students;
}
