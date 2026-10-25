const universitySelect = document.getElementById("university");
const facultySelect = document.getElementById("faculty");

universitySelect.addEventListener("change", function () {
    const selectedUniversity = this.value;

    facultySelect.innerHTML =
        '<option value="" selected disabled>Select your Faculty</option>';

    const universityFaculties = faculties[selectedUniversity];

    if (!universityFaculties) {
        facultySelect.disabled = true;
        return;
    }

    universityFaculties.forEach(function (faculty) {
        const option = document.createElement("option");

        option.value = faculty;
        option.textContent = faculty;

        facultySelect.appendChild(option);
    });

    facultySelect.disabled = false;
});


const faculties = {
  "Cairo University": [
    "Faculty of Engineering",
    "Faculty of Computers and Artificial Intelligence",
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Physical Therapy",
    "Faculty of Veterinary Medicine",
    "Faculty of Science",
    "Faculty of Nursing",
    "Faculty of Arts",
    "Faculty of Commerce",
    "Faculty of Agriculture",
    "Faculty of Archaeology",
    "Faculty of Dar Al-Ulum",
    "Faculty of Economics and Political Science",
    "Faculty of Mass Communication",
    "Faculty of Law",
    "Faculty of Education",
    "Faculty of Specific Education",
    "Faculty of Early Childhood Education",
    "Faculty of Regional and Urban Planning"
  ],
  "Ain Shams University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Computer and Information Sciences",
    "Faculty of Commerce",
    "Faculty of Al-Alsun",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Archaeology",
    "Faculty of Women for Arts, Science and Education",
    "Faculty of Nursing",
    "Faculty of Agriculture",
    "Faculty of Specific Education",
    "Faculty of Veterinary Medicine"
  ],
  "Capital University (Helwan University)": [
    "Faculty of Engineering (Helwan)",
    "Faculty of Engineering (Mataria)",
    "Faculty of Computers and Artificial Intelligence",
    "Faculty of Science",
    "Faculty of Commerce and Business Administration",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Fine Arts",
    "Faculty of Applied Arts",
    "Faculty of Art Education",
    "Faculty of Music Education",
    "Faculty of Physical Education (Boys)",
    "Faculty of Physical Education (Girls)",
    "Faculty of Tourism and Hotel Management",
    "Faculty of Social Work",
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Nursing",
    "Faculty of Education",
    "Faculty of Technology and Education"
  ],
  "Alexandria University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Computer and Data Science",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Agriculture",
    "Faculty of Agriculture (Saba Basha)",
    "Faculty of Nursing",
    "Faculty of Veterinary Medicine",
    "Faculty of Fine Arts",
    "Faculty of Tourism and Hotels",
    "Faculty of Physical Education (Boys)",
    "Faculty of Physical Education (Girls)",
    "Faculty of Specific Education",
    "Faculty of Economic Studies and Political Science"
  ],
  "Assiut University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Computers and Information",
    "Faculty of Agriculture",
    "Faculty of Veterinary Medicine",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Al-Alsun",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Nursing",
    "Faculty of Physical Education",
    "Faculty of Specific Education",
    "Faculty of Social Work",
    "Faculty of Sugar and Integrated Industries Technology"
  ],
  "Tanta University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Computers and Information",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Specific Education",
    "Faculty of Physical Education"
  ],
  "Mansoura University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Computers and Information Technology",
    "Faculty of Veterinary Medicine",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Law",
    "Faculty of Commerce",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Fine Arts",
    "Faculty of Specific Education",
    "Faculty of Physical Education",
    "Faculty of Tourism and Hotels"
  ],
  "Zagazig University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Computers and Informatics",
    "Faculty of Agriculture",
    "Faculty of Veterinary Medicine",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Nursing",
    "Faculty of Disability and Rehabilitation Sciences",
    "Faculty of Physical Education (Boys)",
    "Faculty of Physical Education (Girls)",
    "Faculty of Specific Education",
    "Faculty of Technology and Development",
    "Faculty of Archaeology"
  ],
  "Minia University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Computers and Information",
    "Faculty of Science",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Arts",
    "Faculty of Al-Alsun",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Specific Education",
    "Faculty of Fine Arts",
    "Faculty of Tourism and Hotels",
    "Faculty of Law",
    "Faculty of Dar Al-Uloom",
    "Faculty of Physical Education"
  ],
  "Menoufia University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Electronic Engineering",
    "Faculty of Computers and Information",
    "Faculty of Science",
    "Faculty of Veterinary Medicine",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Specific Education",
    "Faculty of Physical Education",
    "Faculty of Media"
  ],
  "Suez Canal University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Veterinary Medicine",
    "Faculty of Engineering",
    "Faculty of Computers and Informatics",
    "Faculty of Science",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Commerce",
    "Faculty of Tourism and Hotels",
    "Faculty of Education",
    "Faculty of Arts and Human Sciences",
    "Faculty of Al-Alsun",
    "Faculty of Physical Education"
  ],
  "South Valley University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Physical Therapy",
    "Faculty of Veterinary Medicine",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Computers and Information",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Mass Communication",
    "Faculty of Physical Education",
    "Faculty of Specific Education",
    "Faculty of Archaeology"
  ],
  "Benha University": [
    "Faculty of Medicine",
    "Faculty of Engineering (Benha)",
    "Faculty of Engineering (Shoubra)",
    "Faculty of Computers and Artificial Intelligence",
    "Faculty of Science",
    "Faculty of Veterinary Medicine",
    "Faculty of Agriculture",
    "Faculty of Pharmacy",
    "Faculty of Nursing",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Specific Education",
    "Faculty of Applied Arts",
    "Faculty of Physical Education"
  ],
  "Fayoum University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Computers and Information",
    "Faculty of Science",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Tourism and Hotels",
    "Faculty of Archaeology",
    "Faculty of Arts",
    "Faculty of Social Work",
    "Faculty of Law",
    "Faculty of Physical Education"
  ],
  "Beni-Suef University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Veterinary Medicine",
    "Faculty of Engineering",
    "Faculty of Physical Therapy",
    "Faculty of Agriculture",
    "Faculty of Navigation Science and Space Technology",
    "Faculty of Computers and Artificial Intelligence",
    "Faculty of Science",
    "Faculty of Earth Sciences",
    "Faculty of Special Needs Sciences",
    "Faculty of Applied Arts",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Media",
    "Faculty of Al-Alsun",
    "Faculty of Nursing",
    "Faculty of Physical Education",
    "Faculty of Technology and Education",
    "Faculty of Social Work"
  ],
  "Kafrelsheikh University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Veterinary Medicine",
    "Faculty of Engineering",
    "Faculty of Physical Therapy",
    "Faculty of Computers and Information",
    "Faculty of Science",
    "Faculty of Agriculture",
    "Faculty of Nursing",
    "Faculty of Fisheries and Aquatic Sciences",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Al-Alsun",
    "Faculty of Education",
    "Faculty of Physical Education",
    "Faculty of Specific Education"
  ],
  "Sohag University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Nursing",
    "Faculty of Pharmacy",
    "Faculty of Science",
    "Faculty of Engineering",
    "Faculty of Computers and Artificial Intelligence",
    "Faculty of Agriculture",
    "Faculty of Veterinary Medicine",
    "Faculty of Education",
    "Faculty of Arts",
    "Faculty of Al-Alsun",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Specific Education",
    "Faculty of Technology and Education",
    "Faculty of Physical Education",
    "Faculty of Archaeology"
  ],
  "Port Said University": [
    "Faculty of Engineering",
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Science",
    "Faculty of Nursing",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Specific Education",
    "Faculty of Physical Education",
    "Faculty of Management Technology and Information Systems"
  ],
  "Damanhour University": [
    "Faculty of Science",
    "Faculty of Agriculture",
    "Faculty of Veterinary Medicine",
    "Faculty of Pharmacy",
    "Faculty of Nursing",
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Commerce",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Early Childhood Education",
    "Faculty of Specific Education",
    "Faculty of Law"
  ],
  "Damietta University": [
    "Faculty of Science",
    "Faculty of Education",
    "Faculty of Specific Education",
    "Faculty of Applied Arts",
    "Faculty of Agriculture",
    "Faculty of Commerce",
    "Faculty of Arts",
    "Faculty of Law",
    "Faculty of Nursing",
    "Faculty of Engineering",
    "Faculty of Computers and Artificial Intelligence",
    "Faculty of Physical Education",
    "Faculty of Medicine",
    "Faculty of Archaeology"
  ],
  "Aswan University": [
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Nursing",
    "Faculty of Science",
    "Faculty of Computers and Information",
    "Faculty of Engineering",
    "Faculty of Energy Engineering",
    "Faculty of Agriculture and Natural Resources",
    "Faculty of Veterinary Medicine",
    "Faculty of Commerce",
    "Faculty of Arts",
    "Faculty of Education",
    "Faculty of Specific Education",
    "Faculty of Physical Education",
    "Faculty of Social Work",
    "Faculty of Al-Alsun",
    "Faculty of Archaeology",
    "Faculty of Law"
  ],
  "Suez University": [
    "Faculty of Petroleum and Mining Engineering",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Technology and Education",
    "Faculty of Education",
    "Faculty of Commerce",
    "Faculty of Arts",
    "Faculty of Computer and Information Sciences",
    "Faculty of Economics and Political Science",
    "Faculty of Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Physical Therapy",
    "Faculty of Media",
    "Faculty of Fish Resources"
  ],
  "University of Sadat City": [
    "Faculty of Veterinary Medicine",
    "Faculty of Pharmacy",
    "Faculty of Nursing",
    "Faculty of Education",
    "Faculty of Physical Education",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Tourism and Hotels",
    "Faculty of Computers and Artificial Intelligence"
  ],
  "Arish University": [
    "Faculty of Environmental Agricultural Sciences",
    "Faculty of Education",
    "Faculty of Science",
    "Faculty of Arts",
    "Faculty of Commerce",
    "Faculty of Fish Resources and Marine Biology",
    "Faculty of Human Medicine",
    "Faculty of Veterinary Medicine",
    "Faculty of Computers and Information",
    "Faculty of Physical Education"
  ],
  "Matrouh University": [
    "Faculty of Desert and Environmental Agriculture",
    "Faculty of Veterinary Medicine",
    "Faculty of Education",
    "Faculty of Tourism and Hotels",
    "Faculty of Nursing",
    "Faculty of Specific Education",
    "Faculty of Archaeology",
    "Faculty of Computer and Data Science",
    "Faculty of Physical Education"
  ],
  "New Valley University": [
    "Faculty of Education",
    "Faculty of Agriculture",
    "Faculty of Veterinary Medicine",
    "Faculty of Science",
    "Faculty of Arts",
    "Faculty of Physical Education",
    "Faculty of Human Medicine",
    "Faculty of Dentistry",
    "Faculty of Pharmacy",
    "Faculty of Nursing",
    "Faculty of Computers and Information"
  ],
  "Luxor University": [
    "Faculty of Fine Arts",
    "Faculty of Al-Alsun",
    "Faculty of Tourism and Hotels",
    "Faculty of Archaeology",
    "Faculty of Computers and Information",
    "Faculty of Medicine",
    "Faculty of Education",
    "Faculty of Science",
    "Faculty of Nursing",
    "Faculty of Law",
    "Faculty of Physical Education"
  ],
  "Hurghada University": [
    "Faculty of Education",
    "Faculty of Al-Alsun",
    "Faculty of Computer Science and Artificial Intelligence",
    "Faculty of Tourism and Hotels",
    "Faculty of Marine Sciences and Aquaculture"
  ]
};





const setupForm = document.querySelector("form");

if (setupForm) {
    setupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = localStorage.getItem("loggedInUser");

        if (!email) {
            alert("Please log in first.");
            window.location.href = "index.html";
            return;
        }

        const university = document.getElementById("university").value;
        const faculty = document.getElementById("faculty").value;
        const year = document.getElementById("year").value;
        const semester = document.getElementById("semester").value;
        const subjectsCount = Number(
            document.getElementById("subject").value
        );

        if (!university || !faculty || !year || !semester) {
            alert("Please complete all fields.");
            return;
        }

        if (!Number.isInteger(subjectsCount) ||
            subjectsCount < 1 ||
            subjectsCount > 15) {
            alert("Please enter a number of subjects between 1 and 15.");
            return;
        }

        const profiles =
            JSON.parse(localStorage.getItem("studentProfiles")) || {};

        profiles[email] = {
            university: university,
            faculty: faculty,
            year: year,
            semester: semester,
            subjectsCount: subjectsCount
        };

        localStorage.setItem(
            "studentProfiles",
            JSON.stringify(profiles)
        );

        alert("Your information has been saved!");

        window.location.href = "dashboard.html";
    });
}
