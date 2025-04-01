// script.js

import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let currentUser = null;
let isParent = false;
let familyId = "family1"; // אפשר לשנות לפי הצורך
let tasks = [];
let events = [];
let messages = [];
let currentDate = new Date();
let selectedDate = null;

const db = window.db;
const docRef = () => doc(db, "families", familyId);

function login(user, parent) {
  currentUser = user;
  isParent = parent;
  document.getElementById("login-page").style.display = "none";
  document.getElementById("main-page").style.display = "block";
  document.getElementById("user-type").textContent = user;
  if (isParent) {
    document.getElementById("parent-task-controls").style.display = "block";
    document.getElementById("parent-event-controls").style.display = "block";
    document.getElementById("parent-reminder-controls").style.display = "block";
  }
  loadData();
}

function logout() {
  currentUser = null;
  isParent = false;
  document.getElementById("main-page").style.display = "none";
  location.reload();
}

function showSection(section) {
  const sections = ["tasks", "events", "messages"];
  sections.forEach(id => {
    document.getElementById(id).style.display = (id === section) ? "block" : "none";
  });
  if (section === "events") renderCalendar();
  if (section === "messages") renderMessages();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("menu-btn")?.addEventListener("click", () => {
    const menu = document.getElementById("menu");
    menu.classList.toggle("visible");
    menu.classList.toggle("hidden");
  });
});

async function loadData() {
  const snap = await getDoc(docRef());
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
  await setDoc(docRef(), { tasks, events, messages });
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
    li.innerHTML = `<span class="${task.completed ? 'completed' : ''}">${task.text}</span>`;
    if (isParent) {
      li.innerHTML += `<button onclick="editTask(${i})">ערוך</button><button onclick="removeTask(${i})">מחק</button>`;
    } else {
      li.innerHTML += `<button onclick="toggleTask(${i})">${task.completed ? 'בטל' : 'בוצע'}</button>`;
    }
    list.appendChild(li);
  });
}

function editTask(i) {
  const text = prompt("ערוך את המשימה:", tasks[i].text);
  if (text !== null) {
    tasks[i].text = text.trim();
    renderTasks();
    saveData();
  }
}

function removeTask(i) {
  tasks.splice(i, 1);
  renderTasks();
  saveData();
}

function toggleTask(i) {
  tasks[i].completed = !tasks[i].completed;
  renderTasks();
  saveData();
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const monthLabel = document.getElementById("current-month");
  calendar.innerHTML = "";

  const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  monthLabel.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasEvents = events.some(e => e.date === dateStr);
    const day = document.createElement("div");
    day.textContent = d;
    if (hasEvents) day.classList.add("has-events");
    day.onclick = () => selectDay(d, dateStr);
    calendar.appendChild(day);
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
  const input = document.getElementById("new-event");
  const text = input.value.trim();
  if (text && selectedDate) {
    events.push({ date: selectedDate, text });
    input.value = "";
    renderEvents();
    renderCalendar();
    saveData();
  }
}

function renderEvents() {
  const list = document.getElementById("event-list");
  list.innerHTML = "";
  const dayEvents = events.filter(e => e.date === selectedDate);
  dayEvents.forEach((event, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${event.text}</span>`;
    if (isParent) li.innerHTML += `<button onclick="removeEvent(${i})">מחק</button>`;
    list.appendChild(li);
  });
}

function removeEvent(i) {
  const actualIndex = events.findIndex(e => e.date === selectedDate && e.text === events[i].text);
  events.splice(actualIndex, 1);
  renderEvents();
  renderCalendar();
  saveData();
}

function sendManualReminder() {
  alert("הורים שלחו תזכורת! אל תשכח לבדוק את המשימות שלך.");
}

function sendMessage() {
  const input = document.getElementById("new-message");
  const text = input.value.trim();
  if (text) {
    messages.push({ user: currentUser, text, time: new Date().toISOString() });
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
    li.innerHTML = `<span>${msg.user}:</span> ${msg.text}`;
    list.appendChild(li);
  });
}

window.login = login;
window.logout = logout;
window.showSection = showSection;
window.addTask = addTask;
window.editTask = editTask;
window.removeTask = removeTask;
window.toggleTask = toggleTask;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.addEvent = addEvent;
window.removeEvent = removeEvent;
window.sendManualReminder = sendManualReminder;
window.sendMessage = sendMessage;