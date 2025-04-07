document.addEventListener('DOMContentLoaded', function() {
  // אתחול משתנים גלובליים
  let userData = null;
  let familyData = null;
  let extendedFamilyData = {};
  let isParent = false;
  let currentPage = 'tasks-page';
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let darkMode = localStorage.getItem('darkMode') === 'true';

  // תחילת אפליקציה - בדיקת מצב דארק מוד
  if (darkMode) {
      document.body.classList.add('dark-mode');
      document.getElementById('theme-toggle-btn').innerHTML = '<i class="fas fa-sun"></i>';
  }

  // בדיקת התחברות
  checkAuth().then(async (result) => {
      if (!result) {
          window.location.href = 'index.html';
          return;
      }
      userData = result;
      try {
          isParent = await isParentUser(userData.familyId, userData.currentUser);
          await loadFamilyData();
          
          document.getElementById('user-name').textContent = userData.currentUser;
          document.getElementById('family-display').textContent = familyData.familyName || localStorage.getItem('familyName');
          document.getElementById('user-avatar-letter').textContent = userData.currentUser.charAt(0).toUpperCase();
          
          setupUserPermissions();
          loadTasksData();
          loadCalendarData();
          loadMessagesData();
          loadBudgetData();
          loadMeetingsData();
          
          if (isParent) {
              loadFamilyManagementData();
          }
          
          setupEventListeners();
      } catch (error) {
          console.error("שגיאה בטעינת המידע:", error);
          showNotification("שגיאה בטעינת המידע, אנא נסה שוב מאוחר יותר.", "error");
      }
  });

  function checkAuth() {
      return new Promise((resolve) => {
          const familyId = localStorage.getItem('familyId');
          const userName = localStorage.getItem('userName');
          if (familyId && userName) {
              resolve({
                  currentUser: userName,
                  familyId: familyId
              });
          } else {
              resolve(false);
          }
      });
  }

  async function isParentUser(familyId, userName) {
      if (!familyId) return false;
      
      try {
          const familyDoc = await firebase.firestore().collection('families').doc(familyId).get();
          if (familyDoc.exists) {
              const data = familyDoc.data();
              return data.users[userName] === 'parent';
          }
          return false;
      } catch (error) {
          console.error("שגיאה בבדיקת הרשאות הורה:", error);
          return false;
      }
  }

  async function loadFamilyData() {
      if (!userData.familyId) {
          throw new Error("לא נמצא מזהה משפחה");
      }
      
      try {
          const familyDoc = await firebase.firestore().collection('families').doc(userData.familyId).get();
          if (familyDoc.exists) {
              familyData = familyDoc.data();
              familyData.id = userData.familyId;
              
              if (familyData.connectedFamilies?.length > 0) {
                  await loadExtendedFamilies();
              }
          } else {
              throw new Error("לא נמצאו פרטי משפחה");
          }
      } catch (error) {
          console.error("שגיאה בטעינת נתוני משפחה:", error);
          throw error;
      }
  }

  async function loadExtendedFamilies() {
      if (!familyData.connectedFamilies || familyData.connectedFamilies.length === 0) {
          return;
      }
      
      try {
          const promises = familyData.connectedFamilies.map(familyId => {
              return firebase.firestore().collection('families').doc(familyId).get()
                  .then(doc => {
                      if (doc.exists) {
                          const data = doc.data();
                          data.id = doc.id;
                          extendedFamilyData[doc.id] = data;
                      }
                  });
          });
          
          await Promise.all(promises);
      } catch (error) {
          console.error("שגיאה בטעינת משפחות מורחבות:", error);
      }
  }

  function setupUserPermissions() {
      const parentOnlyElements = document.querySelectorAll('.parent-only');
      const childOnlyElements = document.querySelectorAll('.child-only');
      
      parentOnlyElements.forEach(el => {
          el.style.display = isParent ? '' : 'none';
      });
      
      childOnlyElements.forEach(el => {
          el.style.display = isParent ? 'none' : '';
      });
  }

  async function logMeetingButtonClick() {
      try {
          await firebase.firestore()
              .collection('ab_testing')
              .doc('meeting_button_clicks')
              .set({
                  clicks: firebase.firestore.FieldValue.increment(1)
              }, { merge: true });
      } catch (error) {
          console.error("שגיאה ברישום לחיצה על כפתור פגישה:", error);
      }
  }

  function setupEventListeners() {
      document.querySelectorAll('.nav-btn').forEach(button => {
          button.addEventListener('click', function() {
              const targetPage = this.getAttribute('data-page');
              changePage(targetPage);
          });
      });
      
      document.getElementById('theme-toggle-btn').addEventListener('click', toggleDarkMode);
      document.getElementById('logout-btn').addEventListener('click', logout);
      
      document.getElementById('add-task-btn').addEventListener('click', showTaskModal);
      document.getElementById('close-task-modal').addEventListener('click', () => closeModal('task-modal'));
      document.getElementById('save-task-btn').addEventListener('click', saveTask);
      document.getElementById('task-filter').addEventListener('change', filterTasks);
      
      document.getElementById('add-event-btn').addEventListener('click', showEventModal);
      document.getElementById('close-event-modal').addEventListener('click', () => closeModal('event-modal'));
      document.getElementById('save-event-btn').addEventListener('click', saveEvent);
      document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
      document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
      
      document.getElementById('send-message').addEventListener('click', sendMessage);
      document.getElementById('messages-filter').addEventListener('change', filterMessages);
      document.getElementById('tv-request-btn').addEventListener('click', showTVRequestModal);
      document.getElementById('close-tv-modal').addEventListener('click', () => closeModal('tv-request-modal'));
      document.getElementById('send-tv-request-btn').addEventListener('click', sendTVRequest);
      
      if (isParent) {
          document.getElementById('add-budget-btn')?.addEventListener('click', showAddBudgetModal);
          document.getElementById('transfer-btn')?.addEventListener('click', transferMoney);
      }
      
      document.getElementById('create-meeting-btn').addEventListener('click', () => {
          logMeetingButtonClick();
          showNotification("האתר בבנייה, עוד מעט זה יהיה אפשרי", "info");
      });
      document.getElementById('close-meeting-modal').addEventListener('click', () => closeModal('meeting-modal'));
      document.getElementById('create-zoom-meeting').addEventListener('click', createMeeting);
      
      if (isParent) {
          document.getElementById('link-family-btn')?.addEventListener('click', showLinkFamilyModal);
          document.getElementById('close-link-family-modal')?.addEventListener('click', () => closeModal('link-family-modal'));
          document.getElementById('link-family-save-btn')?.addEventListener('click', linkFamily);
          document.getElementById('manage-users-btn')?.addEventListener('click', showManageUsersModal);
          document.getElementById('save-family-settings')?.addEventListener('click', saveFamilySettings);
      }
  }

  function changePage(pageId) {
      document.querySelectorAll('.page').forEach(page => {
          page.classList.remove('active');
      });
      
      document.querySelectorAll('.nav-btn').forEach(btn => {
          btn.classList.remove('active');
      });
      
      document.getElementById(pageId).classList.add('active');
      document.querySelector(`.nav-btn[data-page="${pageId}"]`).classList.add('active');
      
      const pageTitle = document.querySelector(`.nav-btn[data-page="${pageId}"] span`).textContent;
      document.getElementById('current-page-title').textContent = pageTitle;
      
      currentPage = pageId;
  }

  function toggleDarkMode() {
      darkMode = !darkMode;
      document.body.classList.toggle('dark-mode', darkMode);
      document.getElementById('theme-toggle-btn').innerHTML = darkMode ? 
          '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('darkMode', darkMode);
  }

  function logout() {
      localStorage.removeItem('userName');
      localStorage.removeItem('familyId');
      window.location.href = 'index.html';
  }

  async function loadTasksData() {
      try {
          const tasksRef = firebase.firestore().collection('families').doc(userData.familyId).collection('tasks');
          const snapshot = await tasksRef.orderBy('createdAt', 'desc').get();
          
          let tasks = [];
          snapshot.forEach(doc => {
              const task = doc.data();
              task.id = doc.id;
              tasks.push(task);
          });
          
          renderTasks(tasks);
          updateTasksStats(tasks);
      } catch (error) {
          console.error("שגיאה בטעינת משימות:", error);
          showNotification("שגיאה בטעינת משימות", "error");
      }
  }

  function renderTasks(tasks) {
      const container = document.getElementById('tasks-container');
      container.innerHTML = '';
      
      if (tasks.length === 0) {
          container.innerHTML = '<div class="empty-list">אין משימות להצגה</div>';
          return;
      }
      
      tasks.forEach(task => {
          let statusClass = '';
          let dueDateText = '';
          
          if (task.dueDate) {
              const dueDate = new Date(task.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (dueDate < today) {
                  statusClass = 'task-overdue';
              } else if (dueDate.getTime() === today.getTime()) {
                  statusClass = 'task-today';
              }
              
              dueDateText = `<div class="task-due-date">יעד: ${formatDate(task.dueDate)}</div>`;
          }
          
          if (task.priority === 'urgent') {
              statusClass += ' task-urgent';
          }
          
          const taskEl = document.createElement('div');
          taskEl.className = `task-item ${statusClass} ${task.completed ? 'task-completed' : ''}`;
          taskEl.setAttribute('data-id', task.id);
          
          taskEl.innerHTML = `
              <div class="task-content">
                  <div class="task-checkbox">
                      <input type="checkbox" id="task-${task.id}" class="task-complete-checkbox" ${task.completed ? 'checked' : ''}>
                      <label for="task-${task.id}"></label>
                  </div>
                  <div class="task-details">
                      <div class="task-text">${task.text}</div>
                      <div class="task-meta">
                          <div class="task-assigned">אחראי: ${task.assignedTo}</div>
                          ${dueDateText}
                      </div>
                  </div>
              </div>
              <div class="task-actions">
                  ${isParent || task.assignedTo === userData.currentUser ? 
                      `<button class="btn icon-btn delete-task-btn" data-id="${task.id}">
                          <i class="fas fa-trash-alt"></i>
                      </button>` : ''}
              </div>
          `;
          
          container.appendChild(taskEl);
          
          const checkbox = taskEl.querySelector('.task-complete-checkbox');
          checkbox.addEventListener('change', function() {
              toggleTaskComplete(task.id, this.checked);
          });
          
          const deleteBtn = taskEl.querySelector('.delete-task-btn');
          if (deleteBtn) {
              deleteBtn.addEventListener('click', function() {
                  deleteTask(task.id);
              });
          }
      });
  }

  function updateTasksStats(tasks) {
      const completedCount = tasks.filter(task => task.completed).length;
      const pendingCount = tasks.filter(task => !task.completed).length;
      const urgentCount = tasks.filter(task => task.priority === 'urgent' && !task.completed).length;
      
      document.getElementById('completed-tasks-count').textContent = completedCount;
      document.getElementById('pending-tasks-count').textContent = pendingCount;
      document.getElementById('urgent-tasks-count').textContent = urgentCount;
  }

  function showTaskModal() {
      const modal = document.getElementById('task-modal');
      const select = document.getElementById('task-assigned');
      select.innerHTML = '';
      
      const currentOption = document.createElement('option');
      currentOption.value = userData.currentUser;
      currentOption.textContent = userData.currentUser;
      select.appendChild(currentOption);
      
      if (familyData.users) {
          Object.keys(familyData.users).forEach(member => {
              if (member !== userData.currentUser) {
                  const option = document.createElement('option');
                  option.value = member;
                  option.textContent = member;
                  select.appendChild(option);
              }
          });
      }
      
      const dueDateInput = document.getElementById('task-due-date');
      dueDateInput.min = new Date().toISOString().split('T')[0];
      
      modal.style.display = 'flex';
  }

  async function saveTask() {
      const taskText = document.getElementById('task-text').value.trim();
      const assignedTo = document.getElementById('task-assigned').value;
      const priority = document.getElementById('task-priority').value;
      const dueDate = document.getElementById('task-due-date').value;
      
      if (!taskText) {
          showNotification("אנא הזן תיאור למשימה", "error");
          return;
      }
      
      try {
          const taskData = {
              text: taskText,
              assignedTo: assignedTo,
              createdBy: userData.currentUser,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              completed: false,
              priority: priority
          };
          
          if (dueDate) {
              taskData.dueDate = dueDate;
          }
          
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('tasks')
              .add(taskData);
          
          closeModal('task-modal');
          showNotification("המשימה נוצרה בהצלחה", "success");
          loadTasksData();
      } catch (error) {
          console.error("שגיאה ביצירת משימה:", error);
          showNotification("שגיאה ביצירת משימה", "error");
      }
  }

  async function toggleTaskComplete(taskId, isCompleted) {
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('tasks')
              .doc(taskId)
              .update({
                  completed: isCompleted,
                  completedAt: isCompleted ? firebase.firestore.FieldValue.serverTimestamp() : null,
                  completedBy: isCompleted ? userData.currentUser : null
              });
          
          showNotification(isCompleted ? "המשימה הושלמה!" : "המשימה סומנה כלא הושלמה", "success");
          loadTasksData();
      } catch (error) {
          console.error("שגיאה בעדכון משימה:", error);
          showNotification("שגיאה בעדכון משימה", "error");
      }
  }

  async function deleteTask(taskId) {
      if (!confirm("האם אתה בטוח שברצונך למחוק את המשימה?")) {
          return;
      }
      
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('tasks')
              .doc(taskId)
              .delete();
          
          showNotification("המשימה נמחקה בהצלחה", "success");
          loadTasksData();
      } catch (error) {
          console.error("שגיאה במחיקת משימה:", error);
          showNotification("שגיאה במחיקת משימה", "error");
      }
  }

  function filterTasks() {
      const filterValue = document.getElementById('task-filter').value;
      const tasksEls = document.querySelectorAll('.task-item');
      
      tasksEls.forEach(taskEl => {
          const taskId = taskEl.getAttribute('data-id');
          const isCompleted = taskEl.classList.contains('task-completed');
          const isAssigned = taskEl.querySelector('.task-assigned').textContent.includes(userData.currentUser);
          
          let shouldShow = true;
          
          switch (filterValue) {
              case 'all':
                  shouldShow = true;
                  break;
              case 'mine':
                  shouldShow = isAssigned;
                  break;
              case 'completed':
                  shouldShow = isCompleted;
                  break;
              case 'incomplete':
                  shouldShow = !isCompleted;
                  break;
          }
          
          taskEl.style.display = shouldShow ? '' : 'none';
      });
  }

  async function loadCalendarData() {
      updateCalendarHeader();
      renderCalendar();
      
      try {
          const eventsRef = firebase.firestore().collection('families').doc(userData.familyId).collection('events');
          const snapshot = await eventsRef.orderBy('date', 'asc').get();
          
          let events = [];
          snapshot.forEach(doc => {
              const event = doc.data();
              event.id = doc.id;
              events.push(event);
          });
          
          renderEvents(events);
          renderUpcomingEvents(events);
      } catch (error) {
          console.error("שגיאה בטעינת אירועים:", error);
          showNotification("שגיאה בטעינת אירועים", "error");
      }
  }

  function updateCalendarHeader() {
      const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
      document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  function renderCalendar() {
      const calendarDays = document.getElementById('calendar-days');
      calendarDays.innerHTML = '';
      
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      let firstDayIndex = firstDay.getDay();
      
      for (let i = 0; i < firstDayIndex; i++) {
          const dayCell = document.createElement('div');
          dayCell.className = 'calendar-day empty';
          calendarDays.appendChild(dayCell);
      }
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
          const dayCell = document.createElement('div');
          dayCell.className = 'calendar-day';
          
          const today = new Date();
          if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
              dayCell.classList.add('today');
          }
          
          dayCell.innerHTML = `
              <div class="day-number">${day}</div>
              <div class="day-events" data-date="${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}"></div>
          `;
          
          calendarDays.appendChild(dayCell);
          
          dayCell.addEventListener('click', () => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              showEventModal(dateStr);
          });
      }
  }

  function renderEvents(events) {
      document.querySelectorAll('.day-events').forEach(cell => {
          cell.innerHTML = '';
      });
      
      events.forEach(event => {
          const eventDate = event.date.split('T')[0];
          const eventCell = document.querySelector(`.day-events[data-date="${eventDate}"]`);
          
          if (eventCell) {
              const eventEl = document.createElement('div');
              eventEl.className = 'calendar-event';
              eventEl.setAttribute('data-id', event.id);
              eventEl.textContent = event.title;
              
              if (event.time) {
                  eventEl.setAttribute('data-time', event.time);
              }
              
              eventCell.appendChild(eventEl);
              
              eventEl.addEventListener('click', (e) => {
                  e.stopPropagation();
                  showEventDetails(event);
              });
          }
      });
  }

  function renderUpcomingEvents(events) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = events
          .filter(event => new Date(event.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
      
      const container = document.getElementById('upcoming-events-list');
      container.innerHTML = '';
      
      if (upcomingEvents.length === 0) {
          container.innerHTML = '<div class="empty-list">אין אירועים קרובים</div>';
          return;
      }
      
      upcomingEvents.forEach(event => {
          const eventEl = document.createElement('div');
          eventEl.className = 'upcoming-event-item';
          
          eventEl.innerHTML = `
              <div class="event-date">${formatDate(event.date)}</div>
              <div class="event-details">
                  <div class="event-title">${event.title}</div>
                  ${event.time ? `<div class="event-time">${formatTime(event.time)}</div>` : ''}
              </div>
          `;
          
          container.appendChild(eventEl);
          
          eventEl.addEventListener('click', () => {
              showEventDetails(event);
          });
      });
  }

  function showEventModal(selectedDate = '') {
      const modal = document.getElementById('event-modal');
      
      if (selectedDate) {
          document.getElementById('event-date').value = selectedDate;
      } else {
          document.getElementById('event-date').value = new Date().toISOString().split('T')[0];
      }
      
      const notifyUsers = document.getElementById('event-notify-users');
      notifyUsers.innerHTML = '';
      
      if (familyData.users) {
          Object.keys(familyData.users).forEach(member => {
              const checkboxContainer = document.createElement('div');
              checkboxContainer.className = 'checkbox-item';
              const id = `notify-${member.replace(/\s+/g, '-')}`;
              
              checkboxContainer.innerHTML = `
                  <input type="checkbox" id="${id}" value="${member}" ${member === userData.currentUser ? 'checked' : ''}>
                  <label for="${id}">${member}</label>
              `;
              
              notifyUsers.appendChild(checkboxContainer);
          });
      }
      
      modal.style.display = 'flex';
  }

  async function saveEvent() {
      const title = document.getElementById('event-title').value.trim();
      const date = document.getElementById('event-date').value;
      const time = document.getElementById('event-time').value;
      const description = document.getElementById('event-description').value.trim();
      
      const notifyUsers = Array.from(document.querySelectorAll('#event-notify-users input:checked'))
          .map(checkbox => checkbox.value);
      
      if (!title) {
          showNotification("אנא הזן כותרת לאירוע", "error");
          return;
      }
      
      if (!date) {
          showNotification("אנא בחר תאריך לאירוע", "error");
          return;
      }
      
      try {
          const eventData = {
              title: title,
              date: date,
              createdBy: userData.currentUser,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              notifyUsers: notifyUsers
          };
          
          if (time) eventData.time = time;
          if (description) eventData.description = description;
          
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('events')
              .add(eventData);
          
          closeModal('event-modal');
          showNotification("האירוע נוצר בהצלחה", "success");
          loadCalendarData();
      } catch (error) {
          console.error("שגיאה ביצירת אירוע:", error);
          showNotification("שגיאה ביצירת אירוע", "error");
      }
  }

  function showEventDetails(event) {
      let details = `פרטי אירוע: ${event.title}\nתאריך: ${formatDate(event.date)}`;
      if (event.time) details += `\nשעה: ${formatTime(event.time)}`;
      if (event.description) details += `\nתיאור: ${event.description}`;
      if (event.notifyUsers) details += `\nמי שקיבל התראה: ${event.notifyUsers.join(', ')}`;
      
      alert(details);
  }

  function changeMonth(direction) {
      currentMonth += direction;
      
      if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
      } else if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
      }
      
      updateCalendarHeader();
      renderCalendar();
      loadCalendarData();
  }

  async function loadMessagesData() {
      try {
          const messagesRef = firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('messages');
          const snapshot = await messagesRef.orderBy('createdAt', 'desc').get();
          
          let messages = [];
          snapshot.forEach(doc => {
              const message = doc.data();
              message.id = doc.id;
              messages.push(message);
          });
          
          renderMessages(messages);
      } catch (error) {
          console.error("שגיאה בטעינת הודעות:", error);
          showNotification("שגיאה בטעינת הודעות", "error");
      }
  }

  function renderMessages(messages) {
      const container = document.getElementById('messages-list');
      container.innerHTML = '';
      
      if (messages.length === 0) {
          container.innerHTML = '<div class="empty-list">אין הודעות להצגה</div>';
          return;
      }
      
      messages.forEach(message => {
          const messageEl = document.createElement('div');
          messageEl.className = `message-item ${message.type === 'tv-request' ? 'tv-request' : ''}`;
          
          let content = '';
          if (message.type === 'tv-request') {
              content = `
                  <div class="message-header">
                      <span class="message-sender">${message.sender}</span>
                      <span class="message-time">${formatDateTime(message.createdAt)}</span>
                  </div>
                  <div class="message-content">
                      <strong>בקשת טלוויזיה:</strong> ${message.time} דקות
                      ${message.reason ? `<div class="message-reason">סיבה: ${message.reason}</div>` : ''}
                  </div>
              `;
              if (isParent) {
                  content += `
                      <div class="message-actions">
                          <button class="btn approve-btn" data-id="${message.id}">אשר</button>
                          <button class="btn reject-btn" data-id="${message.id}">דחה</button>
                      </div>
                  `;
              }
          } else {
              content = `
                  <div class="message-header">
                      <span class="message-sender">${message.sender}</span>
                      <span class="message-time">${formatDateTime(message.createdAt)}</span>
                  </div>
                  <div class="message-content">${message.text}</div>
              `;
          }
          
          messageEl.innerHTML = content;
          container.appendChild(messageEl);
          
          if (message.type === 'tv-request' && isParent) {
              messageEl.querySelector('.approve-btn').addEventListener('click', () => handleTVRequest(message.id, 'approved'));
              messageEl.querySelector('.reject-btn').addEventListener('click', () => handleTVRequest(message.id, 'rejected'));
          }
      });
  }

  async function sendMessage() {
      const messageText = document.getElementById('new-message').value.trim();
      
      if (!messageText) {
          showNotification("אנא הזן הודעה", "error");
          return;
      }
      
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('messages')
              .add({
                  text: messageText,
                  sender: userData.currentUser,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                  type: 'message'
              });
          
          document.getElementById('new-message').value = '';
          showNotification("ההודעה נשלחה בהצלחה", "success");
          loadMessagesData();
      } catch (error) {
          console.error("שגיאה בשליחת הודעה:", error);
          showNotification("שגיאה בשליחת הודעה", "error");
      }
  }

  function showTVRequestModal() {
      const modal = document.getElementById('tv-request-modal');
      modal.style.display = 'flex';
  }

  async function sendTVRequest() {
      const time = document.getElementById('tv-time').value;
      const reason = document.getElementById('tv-reason').value.trim();
      
      try {
          const messageData = {
              sender: userData.currentUser,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              type: 'tv-request',
              time: parseInt(time),
              status: 'pending'
          };
          
          if (reason) {
              messageData.reason = reason;
          }
          
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('messages')
              .add(messageData);
          
          closeModal('tv-request-modal');
          showNotification("בקשת טלוויזיה נשלחה להורה", "success");
          loadMessagesData();
      } catch (error) {
          console.error("שגיאה בשליחת בקשת טלוויזיה:", error);
          showNotification("שגיאה בשליחת בקשת טלוויזיה", "error");
      }
  }

  async function handleTVRequest(messageId, status) {
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('messages')
              .doc(messageId)
              .update({
                  status: status,
                  respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  respondedBy: userData.currentUser
              });
          
          showNotification(`בקשת טלוויזיה ${status === 'approved' ? 'אושרה' : 'נדחתה'}`, "success");
          loadMessagesData();
      } catch (error) {
          console.error("שגיאה בטיפול בבקשת טלוויזיה:", error);
          showNotification("שגיאה בטיפול בבקשת טלוויזיה", "error");
      }
  }

  function filterMessages() {
      const filterValue = document.getElementById('messages-filter').value;
      const messagesEls = document.querySelectorAll('.message-item');
      
      messagesEls.forEach(messageEl => {
          const isTVRequest = messageEl.classList.contains('tv-request');
          let shouldShow = true;
          
          switch (filterValue) {
              case 'all':
                  shouldShow = true;
                  break;
              case 'tv-requests':
                  shouldShow = isTVRequest;
                  break;
              case 'notifications':
                  shouldShow = !isTVRequest;
                  break;
          }
          
          messageEl.style.display = shouldShow ? '' : 'none';
      });
  }

  async function loadBudgetData() {
      try {
          const familyDoc = await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .get();
          
          if (familyDoc.exists) {
              const data = familyDoc.data();
              const balances = data.balances || {};
              const transactions = data.transactions || [];
              
              renderBalances(balances);
              renderTransactions(transactions);
              populateTransferOptions(balances);
          }
      } catch (error) {
          console.error("שגיאה בטעינת נתוני תקציב:", error);
          showNotification("שגיאה בטעינת נתוני תקציב", "error");
      }
  }

  function renderBalances(balances) {
      const container = document.getElementById('balances-list');
      container.innerHTML = '';
      
      if (Object.keys(balances).length === 0) {
          container.innerHTML = '<div class="empty-list">אין יתרות להצגה</div>';
          return;
      }
      
      for (const [member, amount] of Object.entries(balances)) {
          const balanceEl = document.createElement('div');
          balanceEl.className = 'balance-item';
          balanceEl.innerHTML = `
              <div class="balance-member">${member}</div>
              <div class="balance-amount ${amount >= 0 ? 'positive' : 'negative'}">${amount} ₪</div>
          `;
          container.appendChild(balanceEl);
      }
  }

  function renderTransactions(transactions) {
      const container = document.getElementById('transactions-list');
      container.innerHTML = '';
      
      if (transactions.length === 0) {
          container.innerHTML = '<div class="empty-list">אין פעולות להצגה</div>';
          return;
      }
      
      transactions.sort((a, b) => b.createdAt - a.createdAt).forEach(transaction => {
          const transactionEl = document.createElement('div');
          transactionEl.className = 'transaction-item';
          transactionEl.innerHTML = `
              <div class="transaction-date">${formatDateTime(transaction.createdAt)}</div>
              <div class="transaction-details">
                  <div class="transaction-from-to">${transaction.from} העביר ${transaction.amount} ₪ ל-${transaction.to}</div>
                  ${transaction.note ? `<div class="transaction-note">הערה: ${transaction.note}</div>` : ''}
              </div>
          `;
          container.appendChild(transactionEl);
      });
  }

  function populateTransferOptions(balances) {
      const select = document.getElementById('transfer-to');
      select.innerHTML = '';
      
      for (const member of Object.keys(balances)) {
          if (member !== userData.currentUser) {
              const option = document.createElement('option');
              option.value = member;
              option.textContent = member;
              select.appendChild(option);
          }
      }
  }

  function showAddBudgetModal() {
      // Placeholder for showing the add budget modal
      showNotification("פונקציה זו עדיין לא מיושמת", "info");
  }

  async function transferMoney() {
      const toMember = document.getElementById('transfer-to').value;
      const amount = parseInt(document.getElementById('transfer-amount').value);
      const note = document.getElementById('transfer-note').value.trim();
      
      if (!toMember || !amount || amount <= 0) {
          showNotification("אנא בחר נמען וסכום תקין", "error");
          return;
      }
      
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .update({
                  [`balances.${userData.currentUser}`]: firebase.firestore.FieldValue.increment(-amount),
                  [`balances.${toMember}`]: firebase.firestore.FieldValue.increment(amount),
                  transactions: firebase.firestore.FieldValue.arrayUnion({
                      from: userData.currentUser,
                      to: toMember,
                      amount: amount,
                      note: note || '',
                      createdAt: firebase.firestore.FieldValue.serverTimestamp()
                  })
              });
          
          showNotification("ההעברה בוצעה בהצלחה", "success");
          loadBudgetData();
      } catch (error) {
          console.error("שגיאה בביצוע העברה:", error);
          showNotification("שגיאה בביצוע העברה", "error");
      }
  }

  async function loadMeetingsData() {
      try {
          const meetingsRef = firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('meetings');
          const snapshot = await meetingsRef.orderBy('createdAt', 'desc').get();
          
          let meetings = [];
          snapshot.forEach(doc => {
              const meeting = doc.data();
              meeting.id = doc.id;
              meetings.push(meeting);
          });
          
          renderMeetings(meetings);
      } catch (error) {
          console.error("שגיאה בטעינת פגישות:", error);
          showNotification("שגיאה בטעינת פגישות", "error");
      }
  }

  function renderMeetings(meetings) {
      const upcomingContainer = document.getElementById('upcoming-meetings-list');
      const pastContainer = document.getElementById('past-meetings-list');
      upcomingContainer.innerHTML = '';
      pastContainer.innerHTML = '';
      
      const now = new Date();
      const upcoming = meetings.filter(meeting => new Date(meeting.date) >= now);
      const past = meetings.filter(meeting => new Date(meeting.date) < now);
      
      if (upcoming.length === 0) {
          upcomingContainer.innerHTML = '<div class="empty-list">אין פגישות קרובות</div>';
      } else {
          upcoming.forEach(meeting => {
              const meetingEl = document.createElement('div');
              meetingEl.className = 'meeting-item';
              meetingEl.innerHTML = `
                  <div class="meeting-title">${meeting.title}</div>
                  <div class="meeting-date">${formatDate(meeting.date)}</div>
                  <div class="meeting-time">${meeting.time}</div>
              `;
              upcomingContainer.appendChild(meetingEl);
          });
      }
      
      if (past.length === 0) {
          pastContainer.innerHTML = '<div class="empty-list">אין פגישות קודמות</div>';
      } else {
          past.forEach(meeting => {
              const meetingEl = document.createElement('div');
              meetingEl.className = 'meeting-item';
              meetingEl.innerHTML = `
                  <div class="meeting-title">${meeting.title}</div>
                  <div class="meeting-date">${formatDate(meeting.date)}</div>
                  <div class="meeting-time">${meeting.time}</div>
              `;
              pastContainer.appendChild(meetingEl);
          });
      }
  }

  async function createMeeting() {
      const title = document.getElementById('meeting-title').value.trim();
      const date = document.getElementById('meeting-date').value;
      const time = document.getElementById('meeting-time').value;
      const duration = document.getElementById('meeting-duration').value;
      
      if (!title || !date || !time) {
          showNotification("אנא מלא את כל השדות הנדרשים", "error");
          return;
      }
      
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .collection('meetings')
              .add({
                  title: title,
                  date: date,
                  time: time,
                  duration: parseInt(duration),
                  createdBy: userData.currentUser,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
          
          closeModal('meeting-modal');
          showNotification("פגישה נוצרה בהצלחה", "success");
          loadMeetingsData();
      } catch (error) {
          console.error("שגיאה ביצירת פגישה:", error);
          showNotification("שגיאה ביצירת פגישה", "error");
      }
  }

  async function loadFamilyManagementData() {
      try {
          const familyDoc = await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .get();
          
          if (familyDoc.exists) {
              const data = familyDoc.data();
              document.getElementById('family-name').value = data.familyName || '';
              document.getElementById('family-type').value = data.familyType || 'primary';
              // Populate other family management fields as needed
          }
      } catch (error) {
          console.error("שגיאה בטעינת נתוני ניהול משפחה:", error);
          showNotification("שגיאה בטעינת נתוני ניהול משפחה", "error");
      }
  }

  function showLinkFamilyModal() {
      const modal = document.getElementById('link-family-modal');
      modal.style.display = 'flex';
  }

  async function linkFamily() {
      const familyCode = document.getElementById('family-code').value.trim();
      const relationshipType = document.getElementById('relationship-type').value;
      
      if (!familyCode) {
          showNotification("אנא הזן קוד משפחה", "error");
          return;
      }
      
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .update({
                  connectedFamilies: firebase.firestore.FieldValue.arrayUnion(familyCode)
              });
          
          closeModal('link-family-modal');
          showNotification("משפחה קושרה בהצלחה", "success");
          loadFamilyData();
      } catch (error) {
          console.error("שגיאה בקישור משפחה:", error);
          showNotification("שגיאה בקישור משפחה", "error");
      }
  }

  function showManageUsersModal() {
      // Placeholder for showing the manage users modal
      showNotification("פונקציה זו עדיין לא מיושמת", "info");
  }

  async function saveFamilySettings() {
      const familyName = document.getElementById('family-name').value.trim();
      const familyType = document.getElementById('family-type').value;
      
      if (!familyName) {
          showNotification("אנא הזן שם משפחה", "error");
          return;
      }
      
      try {
          await firebase.firestore()
              .collection('families')
              .doc(userData.familyId)
              .update({
                  familyName: familyName,
                  familyType: familyType
              });
          
          showNotification("הגדרות המשפחה נשמרו בהצלחה", "success");
          loadFamilyData();
      } catch (error) {
          console.error("שגיאה בשמירת הגדרות משפחה:", error);
          showNotification("שגיאה בשמירת הגדרות משפחה", "error");
      }
  }

  // Utility Functions
  function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      modal.style.display = 'none';
      const form = modal.querySelector('form');
      if (form) form.reset();
  }

  function showNotification(message, type) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.style.display = 'block';
      setTimeout(() => {
          notification.style.display = 'none';
      }, 3000);
  }

  function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('he-IL');
  }

  function formatTime(timeStr) {
      return timeStr;
  }

  function formatDateTime(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('he-IL');
  }
});
