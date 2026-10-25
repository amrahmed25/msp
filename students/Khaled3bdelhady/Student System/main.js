//login
const loginForm = document.querySelector("#loginForm");


if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("Password");

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(function (account) {
            return account.email.toLowerCase() === email;
        });

        if (!user) {
            alert("This email doesn't have an account. Please register first.");

            window.location.href = "register.html";
            return;
        }

        if (user.password !== password) {
            alert("Incorrect password. Please try again.");
            return;
        }


        localStorage.setItem("loggedInUser", user.email);

        alert("Login successful!");

        const profiles = JSON.parse(
            localStorage.getItem("studentProfiles")
        ) || {};

        if (profiles[user.email]) {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "setup.html";
        }

    });
}




//Register 
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const fullNameInput = document.getElementById("username");
        const emailInput = document.getElementById("regEmail");
        const passwordInput = document.getElementById("Password");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!fullName || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const emailExists = users.some(function (user) {
            return user.email.toLowerCase() === email;
        });

        if (emailExists) {
            alert("This email already has an account. Please log in.");
            window.location.href = "index.html";
            return;
        }

        const firstName = fullName.split(/\s+/)[0];

        const newUser = {
            fullName: fullName,
            firstName: firstName,
            email: email,
            password: password
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        localStorage.setItem("loggedInUser", email);

        alert("Account created successfully!");

        window.location.href = "setup.html";
    });
}

document.querySelectorAll(".password-toggle").forEach(function (toggleButton) {
    toggleButton.addEventListener("click", function () {
        const targetId = this.dataset.target;
        const passwordInput = document.getElementById(targetId);

        if (!passwordInput) return;

        const icon = this.querySelector("i");
        const showPassword = passwordInput.type === "password";

        passwordInput.type = showPassword ? "text" : "password";

        if (icon) {
            icon.classList.toggle("bi-eye-fill", !showPassword);
            icon.classList.toggle("bi-eye-slash-fill", showPassword);
        }
    });
});

// Subject Cards

const subjectsContainer = document.getElementById("subjectsContainer");

if (subjectsContainer) {
    const email = localStorage.getItem("loggedInUser");
    const profiles =
        JSON.parse(localStorage.getItem("studentProfiles")) || {};

    const profile = profiles[email];

    if (!profile) {
        subjectsContainer.textContent =
            "Please complete your setup first.";
    } else {
        const allSubjects =
            JSON.parse(localStorage.getItem("studentSubjects")) || {};

        const savedSubjects = allSubjects[email] || [];
        subjectsContainer.replaceChildren();

        for (let i = 0; i < profile.subjectsCount; i++) {
            const subject = savedSubjects[i] || {};

            const card = document.createElement("div");
            card.className = "subject-card";

            const number = document.createElement("div");
            number.className = "sub-num";
            number.textContent = String(i + 1).padStart(2, "0");

            const title = document.createElement("h3");
            title.className = "subject-title";
            title.textContent = subject.name || `Subject ${i + 1}`;

            const description = document.createElement("p");
            description.className = "subject-description";
            description.textContent = subject.name
                ? "Your subject is ready to manage."
                : "Add a name to get started.";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "subject-edit-btn";
            editButton.innerHTML =
                '<i class="bi bi-pencil-square"></i> Add / Edit Subject';

            editButton.addEventListener("click", function () {
                const subjectName = prompt(
                    "Enter subject name:",
                    subject.name || ""
                );

                if (subjectName === null) return;

                const name = subjectName.trim();

                if (!name) {
                    alert("Subject name cannot be empty.");
                    return;
                }

                const currentSubjects =
                    JSON.parse(localStorage.getItem("studentSubjects")) || {};

                if (!currentSubjects[email]) {
                    currentSubjects[email] = [];
                }

                currentSubjects[email][i] = { name };

                localStorage.setItem(
                    "studentSubjects",
                    JSON.stringify(currentSubjects)
                );

                subject.name = name;
                title.textContent = name;
                description.textContent =
                    "Your subject is ready to manage.";
            });

            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "subject-view-btn";
            viewButton.innerHTML =
                '<i class="bi bi-eye"></i> View Details';

            viewButton.addEventListener("click", function () {
                const subjectName =
                    subject.name || `Subject ${i + 1}`;

                window.location.href =
                    "subject_details.html?name=" +
                    encodeURIComponent(subjectName);
            });

            card.append(number, title, description, editButton, viewButton);
            subjectsContainer.appendChild(card);
        }
    }
}


if (welcomeMessage) {
    const email = localStorage.getItem("loggedInUser");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const profiles =
        JSON.parse(localStorage.getItem("studentProfiles")) || {};

    const currentUser = users.find(user => user.email === email);
    const profile = profiles[email];

    if (currentUser && currentUser.firstName) {
        welcomeMessage.textContent =
            `Welcome back, ${currentUser.firstName}!`;
    }

    if (profile) {
        document.getElementById("universityName").textContent =
            profile.university || "University Name";

        document.getElementById("facultyName").textContent =
            profile.faculty || "Faculty Name";

        document.getElementById("semesterName").textContent =
            profile.semester
                ? `Semester ${profile.semester}`
                : "Semester";

        document.getElementById("yearName").textContent =
            profile.year
                ? `Year ${profile.year}`
                : "Year";

        document.getElementById("totalSubjects").textContent =
            profile.subjectsCount ?? 0;
    }
}




// Weekly Study Plan 
(() => {
    const daysContainer = document.querySelector(".days");
    if (!daysContainer) return;

    const saveButton = document.getElementById("saveStudyPlan");
    const sessionsCount = document.getElementById("sessionsCount");
    const studyHours = document.getElementById("studyHours");
    const completedCount = document.getElementById("completedCount");
    const totalCount = document.getElementById("totalCount");

    const email = localStorage.getItem("loggedInUser");
    const storageKey = `studyPlan_${email || "guest"}`;

    let nextId = 1;
    let sessions = loadSessions();

    function loadSessions() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
            return saved.days ? saved : { days: {} };
        } catch {
            return { days: {} };
        }
    }

    function getDayName(day) {
        return day.querySelector("h3").textContent.trim();
    }

    function getDaySessions(dayName) {
        if (!sessions.days[dayName]) {
            sessions.days[dayName] = [];
        }
        return sessions.days[dayName];
    }

    function createSessionCard(session, dayName) {
        const card = document.createElement("div");
        card.className = "study-session";
        if (session.completed) card.classList.add("completed");

        const label = document.createElement("label");
        label.className = "session-check";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(session.completed);
        checkbox.setAttribute("aria-label", `Complete ${session.name}`);

        checkbox.addEventListener("change", () => {
            session.completed = checkbox.checked;
            render();
        });

        const name = document.createElement("span");
        name.className = "session-name";
        name.textContent = session.name;

        const duration = document.createElement("span");
        duration.className = "session-duration";
        duration.innerHTML = '<i class="bi bi-clock"></i> ';
        duration.append(document.createTextNode(`${session.hours} h`));

        label.append(checkbox, name);
        card.append(label, duration);

        return card;
    }

    function render() {
        let total = 0;
        let hours = 0;
        let completed = 0;

        document.querySelectorAll(".day").forEach(day => {
            const dayName = getDayName(day);
            const list = day.querySelector(".sessions-list");
            if (!list) return;

            list.replaceChildren();

            getDaySessions(dayName).forEach(session => {
                total++;
                hours += Number(session.hours) || 0;
                if (session.completed) completed++;

                list.append(createSessionCard(session, dayName));
            });
        });

        sessionsCount.textContent = total;
        studyHours.textContent = Number(hours.toFixed(2));
        completedCount.textContent = completed;
        totalCount.textContent = total;
    }

    function openSessionDialog(dayName) {
        const modal = document.createElement("div");
        modal.className = "session-modal-overlay";

        modal.innerHTML = `
            <form class="session-modal">
                <button type="button" class="modal-close" aria-label="Close">
                    <i class="bi bi-x-lg"></i>
                </button>
                <div class="modal-icon"><i class="bi bi-journal-plus"></i></div>
                <h2>Add Study Session</h2>
                <p class="modal-day"></p>

                <label for="sessionName">Session name</label>
                <input id="sessionName" type="text"
                    placeholder="e.g. Study Mathematics" maxlength="100" required>

                <label for="sessionHours">Duration (hours)</label>
                <input id="sessionHours" type="number"
                    placeholder="e.g. 1.5" min="0.25" max="24"
                    step="0.25" required>

                <button type="submit" class="modal-add">
                    <i class="bi bi-plus-circle"></i> Add Session
                </button>
            </form>
        `;

        modal.querySelector(".modal-day").textContent = dayName;

        document.body.append(modal);

        const form = modal.querySelector("form");
        const nameInput = modal.querySelector("#sessionName");

        function closeModal() {
            modal.remove();
        }

        modal.querySelector(".modal-close").addEventListener("click", closeModal);
        modal.addEventListener("click", event => {
            if (event.target === modal) closeModal();
        });


    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const hoursInput = modal.querySelector("#sessionHours");
        const hours = Number(hoursInput.value);

        if (!name || hoursInput.value.trim() === "" ||
            !Number.isFinite(hours) || hours < 0.25 || hours > 24) {
            alert("Enter a session name and a duration between 0.25 and 24 hours.");
            return;
        }

        getDaySessions(dayName).push({
            id: nextId++,
            name: name,
            hours: hours,
            completed: false
        });

        closeModal();
        render();
    });


        nameInput.focus();
    }

    document.querySelectorAll(".day").forEach(day => {
        const dayName = getDayName(day);
        const button = day.querySelector("button");

        if (button) {
            button.classList.add("add-session-btn");
            button.addEventListener("click", () => openSessionDialog(dayName));
        }

        if (!day.querySelector(".sessions-list")) {
            const list = document.createElement("div");
            list.className = "sessions-list";
            button ? day.insertBefore(list, button) : day.append(list);
        }
    });

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            if (!email) {
                alert("Please log in before saving your study plan.");
                return;
            }

            localStorage.setItem(storageKey, JSON.stringify(sessions));
            alert("Your study plan has been saved!");
        });
    }

    render();
})();



//Schedule
(() => {
    const table = document.querySelector(".mytable table");
    const saveButton = document.querySelector(".mytable > button");

    if (!table || !saveButton) return;

    const email = localStorage.getItem("loggedInUser");
    const storageKey = `universitySchedule_${email || "guest"}`;

    function loadSchedule() {
        try {
            const savedSchedule = JSON.parse(
                localStorage.getItem(storageKey)
            );

            if (!Array.isArray(savedSchedule)) return;

            const rows = table.querySelectorAll("tr");

            rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) return; 

                const cells = row.querySelectorAll("td");
                const savedRow = savedSchedule[rowIndex - 1];

                if (!Array.isArray(savedRow)) return;

                cells.forEach((cell, cellIndex) => {
                    cell.textContent = savedRow[cellIndex] ?? "";
                });
            });
        } catch (error) {
            console.error("Could not load schedule:", error);
        }
    }

    saveButton.addEventListener("click", () => {
        const rows = table.querySelectorAll("tr");
        const schedule = [];

        rows.forEach((row, rowIndex) => {
            if (rowIndex === 0) return; 

            const cells = row.querySelectorAll("td");
            const rowData = [];

            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());
            });

            schedule.push(rowData);
        });

        try {
            localStorage.setItem(storageKey, JSON.stringify(schedule));
            alert("Your schedule has been saved successfully!");
        } catch (error) {
            alert("Could not save your schedule. Please try again.");
            console.error("Could not save schedule:", error);
        }
    });

    loadSchedule();
})();



//TO DO
(() => {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const tasksContainer = document.querySelector(".tasks-section");
    
    if (!addTaskBtn || !tasksContainer) return;

    const nameInput = document.getElementById("task-name");
    const subjectInput = document.getElementById("task-subject");
    const durationInput = document.getElementById("task-duration");
    const priorityInput = document.getElementById("task-priority");

    const totalEl = document.getElementById("totalTasks");
    const completedEl = document.getElementById("completedTasks");
    const pendingEl = document.getElementById("pendingTasks");
    const highPriorityEl = document.getElementById("highPriorityTasks");

    const list = document.getElementById("tasksList");

    if (!list) return;

    const email = localStorage.getItem("loggedInUser") || "guest";
    function loadSubjects() {
    const allSubjects =
        JSON.parse(localStorage.getItem("studentSubjects")) || {};

    const savedSubjects = allSubjects[email] || [];

    subjectInput.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Subject";
    defaultOption.disabled = true;
    defaultOption.selected = true;

    subjectInput.appendChild(defaultOption);

    savedSubjects.forEach(subject => {
        if (!subject || !subject.name || !subject.name.trim()) return;

        const option = document.createElement("option");
        option.value = subject.name;
        option.textContent = subject.name;

        subjectInput.appendChild(option);
    });
}

loadSubjects();
    const storageKey = `todoTasks_${email}`;

    let tasks = [];
    let editingId = null;
    let currentFilter = "All";

    try {
        tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
        if (!Array.isArray(tasks)) tasks = [];
    } catch {
        tasks = [];
    }

    function saveTasks() {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
    }

    function updateStats() {
        totalEl.textContent = tasks.length;
        completedEl.textContent =
            tasks.filter(task => task.completed).length;
        pendingEl.textContent =
            tasks.filter(task => !task.completed).length;
        highPriorityEl.textContent =
            tasks.filter(task => task.priority === "High").length;
    }

    function renderTasks() {
        list.replaceChildren();

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === "Pending") return !task.completed;
            if (currentFilter === "Completed") return task.completed;
            if (currentFilter === "High Priority") {
                return task.priority === "High";
            }
            return true;
        });

        filteredTasks.forEach(task => {
            const card = document.createElement("div");
            card.className = "task-card";

            const info = document.createElement("div");
            info.className = "task-info";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.setAttribute("aria-label", "Mark task completed");

            checkbox.addEventListener("change", () => {
                task.completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            const title = document.createElement("h3");
            title.textContent = task.name;

            const subject = document.createElement("p");
            subject.textContent = task.subject;

            const priority = document.createElement("h5");
            priority.textContent = task.priority;

            const duration = document.createElement("p");
            duration.textContent = `${task.duration} minutes`;

            info.append(checkbox, title, subject, priority, duration);

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "edit-btn";
            editBtn.title = "Edit task";
            editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';

            editBtn.addEventListener("click", () => {
                nameInput.value = task.name;
                subjectInput.value = task.subject;
                durationInput.value = task.duration;
                priorityInput.value = task.priority;

                editingId = task.id;
                addTaskBtn.textContent = "Update Task";
                nameInput.focus();
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "delete-btn";
            deleteBtn.title = "Delete task";
            deleteBtn.innerHTML = '<i class="bi bi-trash3"></i>';

            deleteBtn.addEventListener("click", () => {
                tasks = tasks.filter(item => item.id !== task.id);

                if (editingId === task.id) {
                    resetForm();
                }

                saveTasks();
                renderTasks();
            });

            card.append(info, editBtn, deleteBtn);
            list.appendChild(card);
        });

        updateStats();
    }

    function resetForm() {
        nameInput.value = "";
        subjectInput.selectedIndex = 0;
        durationInput.value = "";
        priorityInput.selectedIndex = 0;

        editingId = null;
        addTaskBtn.textContent = "+ Add Task";
    }

    addTaskBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const subject = subjectInput.value;
        const duration = Number(durationInput.value);
        const priority = priorityInput.value;

        if (
            !name ||
            !subject ||
            subject === "Select Subject" ||
            !Number.isFinite(duration) ||
            duration < 1 ||
            !priority ||
            priority === "Priority"
        ) {
            alert("Please fill in all task fields correctly.");
            return;
        }

        if (editingId !== null) {
            const task = tasks.find(item => item.id === editingId);

            if (task) {
                task.name = name;
                task.subject = subject;
                task.duration = duration;
                task.priority = priority;
            }
        } else {
            tasks.push({
                id: Date.now(),
                name,
                subject,
                duration,
                priority,
                completed: false
            });
        }

        saveTasks();
        resetForm();
        renderTasks();
    });

    tasksContainer.querySelectorAll("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    renderTasks();
})();

