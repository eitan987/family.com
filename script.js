import { db, ref, set, get } from '/firebase-setup.js';

// משתנים גלובליים
let currentUser = null;
let isParent = false;
let currentFamilyId = null;
let tasks = [];
let events = [];
let currentDate = new Date();
let selectedDate = null;

// טעינת EmailJS
function loadEmailJS() {
  const script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
  script.onload = () => {
    emailjs.init("xuPsiL8LsYTlmZuB6"); // החלף ב-Public Key שלך מ-EmailJS
  };
  document.head.appendChild(script);
}

// שליחת אימייל
function sendEmail(toEmail, subject, message) {
  emailjs.send("service_dks40ie", "template_e3osxgx", {
    to_email: toEmail,
    subject: subject,
    message: message
  }).then(
    () => console.log("אימייל נשלח בהצלחה"),
    (error) => console.error("שגיאה בשליחת אימייל:", error)
  );
}

// המתנה לטעינת ה-DOM
document.addEventListener("DOMContentLoaded", () => {
  loadEmailJS();

  const menuBtn = document.getElementById("menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const menu = document.getElementById("menu");
      if (menu) {
        menu.classList.toggle("visible");
        menu.classList.toggle("hidden");
      }
    });
  }

  // טעינת משפחות קיימות
  loadFamilies();
});

// טעינת רשימת משפחות קיימות
async function loadFamilies() {
  const familySelect = document.getElementById("family-select");
  if (!familySelect) return;

  try {
    const familiesRef = ref(db, 'families');
    const snapshot = await get(familiesRef);
    if (snapshot.exists()) {
      const families = snapshot.val();
      familySelect.innerHTML = '<option value="">בחר משפחה</option>';
      Object.keys(families).forEach(familyId => {
        const option = document.createElement("option");
        option.value = familyId;
        option.textContent = familyId;
        familySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("שגיאה בטעינת משפחות:", error);
  }
}

// הרשמה למשפחה חדשה
async function registerFamily() {
  const familyName = document.getElementById("new-family-name").value.trim();
  const email = document.getElementById("email-input").value.trim();

  if (!familyName || !email) {
    alert("נא למלא את כל השדות");
    return;
  }

  try {
    // שמירת בקשת הרשמה
    const pendingRef = ref(db, `pendingRegistrations/${familyName}`);
    await set(pendingRef, { email, action: "הרשמה", timestamp: new Date().toISOString() });

    // שליחת אימייל לאיתן
    sendEmail(
      "eitan.yifrach@gmail.com",
      "בקשת הרשמה חדשה",
      `משפחה חדשה בשם "${familyName}" ביקשה להירשם.\nאימייל: ${email}\nפעולה: הרשמה`
    );

    alert("בקשת ההרשמה נשלחה. תקבל אימייל אישור בקרוב.");
  } catch (error) {
    console.error("שגיאה בהרשמה:", error);
    alert("שגיאה בהרשמה, נסה שוב.");
  }
}

// התחברות למשפחה קיימת
async function connectToFamily() {
  const familyId = document.getElementById("family-select").value;
  const email = document.getElementById("email-input").value.trim();

  if (!familyId || !email) {
    alert("נא לבחור משפחה ולמלא אימייל");
    return;
  }

  try {
    // שמירת בקשת התחברות
    const pendingRef = ref(db, `pendingRegistrations/${familyId}_${email}`);
    await set(pendingRef, { email, action: "התחברות", timestamp: new Date().toISOString() });

    // שליחת אימייל לאיתן
    sendEmail(
      "eitan.yifrach@gmail.com",
      "בקשת התחברות למשפחה",
      `משתמש עם אימייל "${email}" ביקש להתחבר למשפחה "${familyId}".\nפעולה: התחברות`
    );

    alert("בקשת ההתחברות נשלחה. תקבל אימייל אישור בקרוב.");
  } catch (error) {
    console.error("שגיאה בהתחברות:", error);
    alert("שגיאה בהתחברות, נסה שוב.");
  }
}

// אישור ידני (לדוגמה, פונקציה שתופעל על ידי איתן)
async function approveRegistration(familyId, email, action) {
  try {
    if (action === "הרשמה") {
      const familyRef = ref(db, `families/${familyId}/main`);
      await set(familyRef, { tasks: [], events: [] });
    }

    // שליחת אימייל אישור למשתמש
    sendEmail(
      email,
      "בקשתך אושרה",
      `בקשתך ל-${action} למשפחה "${familyId}" אושרה בהצלחה!`
    );

    // מחיקת הבקשה ממתינות
    const pendingRef = ref(db, `pendingRegistrations/${familyId}_${email}`);
    await set(pendingRef, null);
  } catch (error) {
    console.error("שגיאה באישור בקשה:", error);
  }
}

// בחירת משפחה והמשך לעמוד הכניסה הנוכחי
function selectFamily(familyId) {
  currentFamilyId = familyId;
  document.getElementById("family-login-page").style.display = "none";
  document.getElementById("login-page").style.display = "block";
}

function login(user, parent) {
  if (!currentFamilyId) {
    alert("נא לבחור משפחה תחילה");
    return;
  }

  currentUser = user;
  isParent = parent;

  const loginPage = document.getElementById("login-page");
  const mainPage = document.getElementById("main-page");
  const userType = document.getElementById("user-type");

  if (!loginPage || !mainPage || !userType) {
    console.error("אחד או יותר מהאלמנטים לא נמצאו ב-DOM");
    return;
  }

  loginPage.style.display = "none";
  mainPage.style.display = "block";
  userType.textContent = user;

  if (isParent) {
    const taskControls = document.getElementById("parent-task-controls");
    const eventControls = document.getElementById("parent-event-controls");
    if (taskControls && eventControls) {
      taskControls.style.display = "block";
      eventControls.style.display = "block";
    }
  }

  loadData();
}

async function loadData() {
  try {
    const familyRef = ref(db, `families/${currentFamilyId}/main`);
    const snapshot = await get(familyRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      tasks = data.tasks || [];
      events = data.events || [];
    }
    renderTasks();
    if (document.getElementById("events")?.style.display === "block") renderCalendar();
  } catch (error) {
    console.error("שגיאה בטעינת נתונים:", error);
    alert("אירעה שגיאה בטעינת הנתונים, נשתמש בנתוני ברירת מחדל.");
  }
}

async function saveData() {
  try {
    const familyRef = ref(db, `families/${currentFamilyId}/main`);
    await set(familyRef, { tasks, events });
  } catch (error) {
    console.error("שגיאה בשמירת נתונים:", error);
    alert("אירעה שגיאה בשמירת הנתונים.");
  }
}

function addTask() {
  if (!isParent) return alert("רק הורים יכולים להוסיף משימות!");
  const taskInput = document.getElementById("new-task");
  const taskText = taskInput.value.trim();
  if (taskText) {
    tasks.push({ text: taskText, completed: false });
    taskInput.value = "";
    renderTasks();
    saveData();
  }
}

function renderTasks() {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
      ${isParent ? `<button onclick="editTask(${index})">ערוך</button><button onclick="removeTask(${index})">מחק</button>` : `<button onclick="toggleTask(${index})">${task.completed ? 'בטל' : 'בוצע'}</button>`}
    `;
    taskList.appendChild(li);
  });
}

function editTask(index) {
  const newText = prompt("ערוך את המשימה:", tasks[index].text);
  if (newText !== null && newText.trim()) {
    tasks[index].text = newText.trim();
    renderTasks();
    saveData();
  }
}

function removeTask(index) {
  tasks.splice(index, 1);
  renderTasks();
  saveData();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
  saveData();
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const currentMonthDisplay = document.getElementById("current-month");
  if (!calendar || !currentMonthDisplay) return;
  calendar.innerHTML = "";

  const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  currentMonthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  daysOfWeek.forEach(day => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "day-header";
    dayHeader.textContent = day;
    calendar.appendChild(dayHeader);
  });

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "empty";
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasEvents = events.some(e => (typeof e === "string" && e === "היום" && isToday(dateStr)) || (e.date === dateStr));
    const dayElement = document.createElement("div");
    dayElement.textContent = day;
    if (hasEvents) dayElement.className = "has-events";
    if (isToday(dateStr)) dayElement.classList.add("today");
    dayElement.onclick = () => selectDay(day, dateStr);
    calendar.appendChild(dayElement);
  }
}

function isToday(dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return dateStr === todayStr;
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
  const selectedDayEvents = document.getElementById("selected-day-events");
  const selectedDayTitle = document.getElementById("selected-day-title");
  if (selectedDayEvents && selectedDayTitle) {
    selectedDayEvents.style.display = "block";
    selectedDayTitle.textContent = `אירועים לתאריך ${day}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
    renderEvents();
  }
}

function addEvent() {
  if (!isParent) return alert("רק הורים יכולים להוסיף אירועים!");
  if (!selectedDate) return alert("בחר יום בלוח השנה!");
  const text = document.getElementById("new-event").value.trim();
  if (text) {
    events.push({ date: selectedDate, text });
    document.getElementById("new-event").value = "";
    renderEvents();
    renderCalendar();
    saveData();
  }
}

function renderEvents() {
  const list = document.getElementById("event-list");
  if (!list) return;
  list.innerHTML = "";
  const dayEvents = events.filter(e => e.date === selectedDate || (e === "היום" && isToday(selectedDate)));
  dayEvents.forEach((event, index) => {
    const li = document.createElement("li");
    const eventText = typeof event === "string" ? event : event.text;
    li.innerHTML = `
      <span>${eventText}</span>
      ${isParent ? `<button onclick="editEvent(${index})">ערוך</button><button onclick="removeEvent(${index})">מחק</button>` : ''}
    `;
    list.appendChild(li);
  });
}

function editEvent(index) {
  const dayEvents = events.filter(e => e.date === selectedDate || (e === "היום" && isToday(selectedDate)));
  const event = dayEvents[index];
  const newText = prompt("ערוך את האירוע:", typeof event === "string" ? event : event.text);
  if (newText !== null && newText.trim()) {
    if (typeof event === "string") {
      const globalIndex = events.indexOf(event);
      events[globalIndex] = newText.trim();
    } else {
      const globalIndex = events.findIndex(e => e.date === selectedDate && e.text === event.text);
      events[globalIndex].text = newText.trim();
    }
    renderEvents();
    renderCalendar();
    saveData();
  }
}

function removeEvent(index) {
  const dayEvents = events.filter(e => e.date === selectedDate || (e === "היום" && isToday(selectedDate)));
  const event = dayEvents[index];
  const globalIndex = typeof event === "string" ? events.indexOf(event) : events.findIndex(e => e.date === selectedDate && e.text === event.text);
  events.splice(globalIndex, 1);
  renderEvents();
  renderCalendar();
  saveData();
}

function logout() {
  currentUser = null;
  isParent = false;
  selectedDate = null;
  currentFamilyId = null;
  document.getElementById("main-page").style.display = "none";
  document.getElementById("login-page").style.display = "none";
  document.getElementById("family-login-page").style.display = "block";
}

function showSection(section) {
  const tasksSection = document.getElementById("tasks");
  const eventsSection = document.getElementById("events");
  if (tasksSection && eventsSection) {
    tasksSection.style.display = section === "tasks" ? "block" : "none";
    eventsSection.style.display = section === "events" ? "block" : "none";
    if (section === "events") renderCalendar();
  }
}

// חשיפת הפונקציות ל-HTML
window.registerFamily = registerFamily;
window.connectToFamily = connectToFamily;
window.selectFamily = selectFamily;
window.login = login;
window.logout = logout;
window.addTask = addTask;
window.editTask = editTask;
window.removeTask = removeTask;
window.toggleTask = toggleTask;
window.showSection = showSection;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.addEvent = addEvent;
window.editEvent = editEvent;
window.removeEvent = removeEvent;