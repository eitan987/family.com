import { db, ref, set, get } from '/firebase-setup.js';

let currentUser = null;
let isParent = false;
let tasks = [
  { text: "רני ויהונתן לארגן יום הולדת לרתם", completed: false },
  { text: "להנות מזה שהצלחתי להכין את זה", completed: true },
  { text: "להחליט על מתנה מסבתא היא ביקשה", completed: false }
];
let events = [
  "היום",
  { date: "2025-03-31", text: "מבחן לאיתן בר אילן" },
  { date: "2025-05-03", text: "בר מצווה לאיתן" }
];
let currentDate = new Date();
let selectedDate = null;

// המתנה לטעינת ה-DOM
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const menu = document.getElementById("menu");
      if (menu) {
        menu.classList.toggle("visible");
        menu.classList.toggle("hidden");
      }
    });
  } else {
    console.error("כפתור התפריט לא נמצא");
  }
});

function login(user, parent) {
  // בדיקת תקינות קלט
  if (!user || typeof parent !== "boolean") {
    console.error("שגיאה בקלט של פונקציית login");
    return;
  }

  currentUser = user;
  isParent = parent;

  // בדיקת זמינות האלמנטים
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
    } else {
      console.error("כלי הניהול להורים לא נמצאו");
    }
  }

  loadData();
}

async function loadData() {
  try {
    const familyRef = ref(db, 'family/main');
    const snapshot = await get(familyRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      tasks = data.tasks || tasks;
      events = data.events || events;
    }
    renderTasks();
    if (document.getElementById("events")?.style.display === "block") renderCalendar();
  } catch (error) {
    console.error("שגיאה בטעינת נתונים:", error);
    alert("אירעה שגיאה בטעינת הנתונים, נשתמש בנתוני ברירת מחדל.");
  }
}

// שאר הפונקציות נשארות כפי שהיו, אני מוסיף רק את החלקים הרלוונטיים ל-login
function renderTasks() {
  const taskList = document.getElementById("task-list");
  if (!taskList) {
    console.error("רשימת המשימות לא נמצאה");
    return;
  }
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

// חתוספת של פונקציות גלובליות
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