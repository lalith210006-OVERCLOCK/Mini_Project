
// ==========================================
// TASKFLOW PRO - JAVASCRIPT
// ==========================================

// 1. SELECT HTML ELEMENTS

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const editId = document.getElementById("editId");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");


// 2. APPLICATION DATA

let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }
} catch {
    tasks = [];
}

let currentStatus = "all";


// 3. SAVE DATA

function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}


// 4. DATE DISPLAY

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });


// 5. ADD OR UPDATE TASK

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    if (!title) return;

    const existingId = editId.value;

    if (existingId) {

        tasks = tasks.map(task => {

            if (task.id === existingId) {
                return {
                    ...task,
                    title: title,
                    category: taskCategory.value,
                    priority: taskPriority.value,
                    date: taskDate.value,
                    time: taskTime.value
                };
            }

            return task;
        });

    } else {

        const newTask = {
            id: crypto.randomUUID(),
            title: title,
            category: taskCategory.value,
            priority: taskPriority.value,
            date: taskDate.value,
            time: taskTime.value,
            completed: false,
            createdAt: Date.now()
        };

        tasks.unshift(newTask);
    }

    saveTasks();

    taskForm.reset();
    resetEditMode();

    renderTasks();
});


// 6. RESET EDIT MODE

function resetEditMode() {

    editId.value = "";

    submitButton.textContent = "+ Add Task";

    document.getElementById("formHeading").textContent =
        "Create a New Task";

    cancelEdit.hidden = true;
}


// 7. EDIT TASK

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    editId.value = task.id;

    taskTitle.value = task.title;
    taskCategory.value = task.category;
    taskPriority.value = task.priority;
    taskDate.value = task.date || "";
    taskTime.value = task.time || "";

    submitButton.textContent = "Save Changes";

    document.getElementById("formHeading").textContent =
        "Edit Your Task";

    cancelEdit.hidden = false;

    document.getElementById("taskForm").scrollIntoView({
        behavior: "smooth"
    });

}


// 8. CANCEL EDIT

cancelEdit.addEventListener("click", function() {

    taskForm.reset();

    resetEditMode();

});


// 9. DELETE TASK

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    if (editId.value === id) {
        taskForm.reset();
        resetEditMode();
    }

    saveTasks();

    renderTasks();
}


// 10. COMPLETE TASK

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


// 11. CHECK OVERDUE TASK

function isOverdue(task) {

    if (!task.date || task.completed) {
        return false;
    }

    const today = new Date();

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    return task.date < todayString;
}


// 12. UPDATE STATISTICS

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const overdue = tasks.filter(
        task => isOverdue(task)
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("overdueTasks").textContent = overdue;

    document.getElementById("progressPercent").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";
}


// 13. FILTER AND SORT TASKS

function getFilteredTasks() {

    let filtered = [...tasks];

    // Status filter

    if (currentStatus === "pending") {
        filtered = filtered.filter(task => !task.completed);
    }

    if (currentStatus === "completed") {
        filtered = filtered.filter(task => task.completed);
    }

    // Search filter

    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search)
    );

    // Priority filter

    const priority =
        document.getElementById("priorityFilter").value;

    if (priority !== "all") {
        filtered = filtered.filter(
            task => task.priority === priority
        );
    }

    // Category filter

    const category =
        document.getElementById("categoryFilter").value;

    if (category !== "all") {
        filtered = filtered.filter(
            task => task.category === category
        );
    }

    // Sorting

    const sort = document.getElementById("sortFilter").value;

    if (sort === "newest") {
        filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (sort === "oldest") {
        filtered.sort((a, b) => a.createdAt - b.createdAt);
    }

    if (sort === "date") {
        filtered.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;

            return a.date.localeCompare(b.date);
        });
    }

    return filtered;
}


// 14. DISPLAY TASKS

function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        // Checkbox

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });


        // Task information

        const info = document.createElement("div");

        info.className = "task-info";

        const heading = document.createElement("h3");

        heading.textContent = task.title;

        const meta = document.createElement("div");

        meta.className = "task-meta";


        // Priority tag

        const priorityTag = document.createElement("span");

        priorityTag.className =
            "tag priority-" + task.priority;

        priorityTag.textContent = task.priority + " Priority";


        // Category tag

        const categoryTag = document.createElement("span");

        categoryTag.className = "tag category-tag";

        categoryTag.textContent = task.category;


        meta.append(priorityTag, categoryTag);


        // Due date

        if (task.date) {

            const dateLabel = document.createElement("span");

            dateLabel.textContent =
                "Due: " + task.date +
                (task.time ? " at " + task.time : "");

            if (isOverdue(task)) {
                dateLabel.className = "overdue";
                dateLabel.textContent += " (Overdue)";
            }

            meta.appendChild(dateLabel);
        }


        info.append(heading, meta);


        // Action buttons

        const actions = document.createElement("div");

        actions.className = "task-actions";

        const editButton = document.createElement("button");

        editButton.className = "edit-btn";

        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });


        actions.append(editButton, deleteButton);

        card.append(checkbox, info, actions);

        taskList.appendChild(card);

    });

    updateStats();
}


// 15. SEARCH AND FILTER EVENTS

document.getElementById("searchInput")
    .addEventListener("input", renderTasks);

document.getElementById("priorityFilter")
    .addEventListener("change", renderTasks);

document.getElementById("categoryFilter")
    .addEventListener("change", renderTasks);

document.getElementById("sortFilter")
    .addEventListener("change", renderTasks);


// 16. SIDEBAR NAVIGATION

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", function() {

        document.querySelector(".nav-item.active")
            .classList.remove("active");

        this.classList.add("active");

        currentStatus = this.dataset.status;

        renderTasks();

    });

});


// 17. DARK MODE

const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("taskflowTheme") === "dark") {
    document.body.classList.add("dark");
}

themeToggle.addEventListener("click", function() {

    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark")
        ? "dark"
        : "light";

    localStorage.setItem("taskflowTheme", theme);

});


// 18. INITIALIZE APP

renderTasks();
