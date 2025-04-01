const parentPassword = "1234";
let isParent = false;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let events = JSON.parse(localStorage.getItem("events")) || [];

function saveToStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("events", JSON.stringify(events));
}

function checkPassword() {
    const input = document.getElementById("password").value;
    if (input === parentPassword) {
        isParent = true;
        enterSite("הורה");
    } else {
        alert("סיסמה שגויה!");
    }
}

function enterAsKid() {
    isParent = false;
    enterSite("ילד");
}

function enterSite(userType) {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    document.getElementById("user-type").textContent = `מחובר כ-${userType}`;
    if (isParent) {
        document.getElementById("parent-task-controls").style.display = "block";
        document.getElementById("parent-event-controls").style.display = "block";
    }
    renderTasks();
    renderEvents();
    alert(`ברוך הבא כ-${userType}! ${isParent ? "אתה יכול לערוך, להוסיף ולמחוק משימות ואירועים" : "אתה יכול לראות אירועים ולסמן משימות"}`);
}

document.getElementById("menu-btn").addEventListener("click", function() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("visible");
    menu.classList.toggle("hidden");
});

function showSection(section) {
    document.getElementById("tasks").style.display = section === "tasks" ? "block" : "none";
    document.getElementById("events").style.display = section === "events" ? "block" : "none";
}

// משימות
function addTask() {
    if (!isParent) return alert("רק הורים יכולים להוסיף משימות!");
    const taskInput = document.getElementById("new-task");
    const taskText = taskInput.value.trim();
    if (taskText) {
        tasks.push({ text: taskText, completed: false });
        taskInput.value = "";
        renderTasks();
        saveToStorage();
    }
}

function editTask(index) {
    if (!isParent) return alert("רק הורים יכולים לערוך משימות!");
    const newText = prompt("ערוך את המשימה:", tasks[index].text);
    if (newText !== null && newText.trim()) {
        tasks[index].text = newText.trim();
        renderTasks();
        saveToStorage();
    }
}

function removeTask(index) {
    if (!isParent) return alert("רק הורים יכולים למחוק משימות!");
    tasks.splice(index, 1);
    renderTasks();
    saveToStorage();
}

function toggleTask(index) {
    if (isParent) return alert("רק ילדים יכולים לסמן משימות!");
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
    saveToStorage();
}

function renderTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            ${isParent ? `<button onclick="editTask(${index})">ערוך</button><button onclick="removeTask(${index})">מחק</button>` : 
                         `<button onclick="toggleTask(${index})">${task.completed ? 'בטל' : 'בוצע'}</button>`}
        `;
        taskList.appendChild(li);
    });
}

// אירועים
function addEvent() {
    if (!isParent) return alert("רק הורים יכולים להוסיף אירועים!");
    const eventInput = document.getElementById("new-event");
    const eventText = eventInput.value.trim();
    if (eventText) {
        events.push(eventText);
        eventInput.value = "";
        renderEvents();
        saveToStorage();
    }
}

function editEvent(index) {
    if (!isParent) return alert("רק הורים יכולים לערוך אירועים!");
    const newText = prompt("ערוך את האירוע:", events[index]);
    if (newText !== null && newText.trim()) {
        events[index] = newText.trim();
        renderEvents();
        saveToStorage();
    }
}

function removeEvent(index) {
    if (!isParent) return alert("רק הורים יכולים למחוק אירועים!");
    events.splice(index, 1);
    renderEvents();
    saveToStorage();
}

function renderEvents() {
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "";
    events.forEach((event, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${event}</span>
            ${isParent ? `<button onclick="editEvent(${index})">ערוך</button><button onclick="removeEvent(${index})">מחק</button>` : ''}
        `;
        eventList.appendChild(li);
    });
}

function logout() {
    document.getElementById("main-page").style.display = "none";
    document.getElementById("login-page").style.display = "block";
    document.getElementById("password").value = "";
    document.getElementById("tasks").style.display = "none";
    document.getElementById("events").style.display = "none";
}