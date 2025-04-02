""let currentUser = null;
let isParent = false;
let tasks = [];
let events = [];
let messages = [];
let currentDate = new Date();
let selectedDate = null;
let familyId = "main";

import { getDoc, setDoc, doc, getFirestore } from "./firebase-setup.js";
const db = getFirestore();

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".user-list button").forEach(button => {
    button.addEventListener("click", () => {
      const user = button.textContent;
      const isParentUser = user === "אבא" || user === "אמא";
      login(user, isParentUser);
    });
  });

  document.getElementById("menu-btn")?.addEventListener("click", () => {
    const menu = document.getElementById("menu");
    menu.classList.toggle("visible");
    menu.classList.toggle("hidden");
  });
});

function login(user, parent) {
  currentUser = user;
  isParent = parent;
  document.getElementById("login-page").style.display = "none";
  document.getElementById("main-page").style.display = "block";
  document.getElementById("user-type").textContent = user;
  if (isParent) {
    document.getElementById("parent-task-controls").style.display = "flex";
    document.getElementById("parent-event-controls").style.display = "flex";
    document.getElementById("parent-reminder-controls").style.display = "block";
  }
  loadData();
}

function showSection(section) {
  const sections = ["tasks", "events", "messages"];
  const index = sections.indexOf(section);
  if (index !== -1) {
    document.querySelector(".carousel-container").scrollTo({
      left: index * window.innerWidth,
      behavior: "smooth"
    });
  }
}

async function loadData() {
  const snap = await getDoc(doc(db, "families", familyId));
  if (snap.exists()) {
    const data = snap.data();
    tasks = data.tasks || [];
    events = data.events || [];
    messages = data.messages || [];
    renderTasks();
    renderCalendar();
    renderMessages();
  }
}

async function saveData() {
  await setDoc(doc(db, "families", familyId), { tasks, events, messages });
}

function addTask() {
  const input = document.getElementById("new-task");
  const text = input.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    input.value = "";
    renderTasks();
    saveData();
  }
}

function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">${task.text}</span>
      ${isParent ? `<button onclick="removeTask(${i})">מחק</button>` : `<button onclick="toggleTask(${i})">${task.completed ? "בטל" : "בוצע"}</button>`}
    `;
    list.appendChild(li);
  });
}

function toggleTask(i) {
  tasks[i].completed = !tasks[i].completed;
  renderTasks();
  saveData();
}

function removeTask(i) {
  tasks.splice(i, 1);
  renderTasks();
  saveData();
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  const monthText = document.getElementById("current-month");
  cal.innerHTML = "";
  const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  monthText.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    cal.appendChild(document.createElement("div"));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth()+1).toString().padStart(2,"0")}-${d.toString().padStart(2,"0")}`;
    const has = events.some(e => e.date === dateStr);
    const div = document.createElement("div");
    div.textContent = d;
    if (has) div.className = "has-events";
    div.onclick = () => selectDay(d, dateStr);
    cal.appendChild(div);
  }
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function selectDay(day, dateStr) {
  selectedDate = dateStr;
  document.getElementById("selected-day-events").style.display = "block";
  document.getElementById("selected-day-title").textContent = `אירועים לתאריך ${day}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
  renderEvents();
}

function addEvent() {
  const text = document.getElementById("new-event").value.trim();
  if (text && selectedDate) {
    events.push({ date: selectedDate, text });
    document.getElementById("new-event").value = "";
    renderEvents();
    renderCalendar();
    saveData();
  }
}

function renderEvents() {
  const list = document.getElementById("event-list");
  list.innerHTML = "";
  const filtered = events.filter(e => e.date === selectedDate);
  filtered.forEach((event, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${event.text}</span>
      ${isParent ? `<button onclick="removeEvent(${i})">מחק</button>` : ""}
    `;
    list.appendChild(li);
  });
}

function removeEvent(i) {
  const actualIndex = events.findIndex(e => e.date === selectedDate && e.text === events[i].text);
  if (actualIndex !== -1) {
    events.splice(actualIndex, 1);
    renderEvents();
    renderCalendar();
    saveData();
  }
}

function sendMessage() {
  const input = document.getElementById("new-message");
  const text = input.value.trim();
  if (text) {
    messages.push({ sender: currentUser, text });
    input.value = "";
    renderMessages();
    saveData();
  }
}

function renderMessages() {
  const list = document.getElementById("message-list");
  list.innerHTML = "";
  messages.forEach(msg => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${msg.sender}:</span><div>${msg.text}</div>`;
    list.appendChild(li);
  });
}

function sendManualReminder() {
  alert("נשלחה תזכורת לבני המשפחה! (דמו בלבד)");
}

function logout() {
  currentUser = null;
  isParent = false;
  document.getElementById("main-page").style.display = "none";
  document.getElementById("login-page").style.display = "block";
}

window.login = login;
window.showSection = showSection;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.removeTask = removeTask;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.addEvent = addEvent;
window.removeEvent = removeEvent;
window.sendMessage = sendMessage;
window.sendManualReminder = sendManualReminder;
window.logout = logout;