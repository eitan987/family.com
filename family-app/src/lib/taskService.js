import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp,
  getDoc,
  setDoc,
  limit,
  startAfter,
  endBefore,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

// שירות ניהול משימות
export const taskService = {
  // קבלת כל המשימות של המשפחה
  getTasks: async (familyId) => {
    if (!familyId) {
      console.error('לא סופק מזהה משפחה');
      return [];
    }

    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('familyId', '==', familyId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(tasksQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(), // המרת Timestamp לתאריך
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      }));
    } catch (error) {
      console.error('שגיאה בקבלת משימות:', error);
      throw error;
    }
  },

  // יצירת משימה חדשה
  createTask: async (taskData) => {
    try {
      const tasksRef = collection(db, "tasks");
      
      // הוספת נתוני זמן לאובייקט המשימה
      const task = {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: taskData.status === 'הושלם' ? serverTimestamp() : null
      };
      
      // שמירת המשימה ב-Firestore
      const docRef = await addDoc(tasksRef, task);
      
      return { 
        id: docRef.id, 
        ...task,
        error: null 
      };
    } catch (error) {
      console.error("Create task error:", error);
      return { error: error.message };
    }
  },

  // עדכון משימה
  updateTask: async (taskId, updateData) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      
      // בדיקה אם המשימה קיימת
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error("משימה לא נמצאה");
      }
      
      // הכנת נתוני העדכון
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      // אם סטטוס המשימה שונה ל"הושלם", עדכון זמן ההשלמה
      if (updateData.status === 'הושלם' && taskSnap.data().status !== 'הושלם') {
        updates.completedAt = serverTimestamp();
      }
      
      // אם סטטוס המשימה שונה מ"הושלם", איפוס זמן ההשלמה
      if (updateData.status && updateData.status !== 'הושלם' && taskSnap.data().status === 'הושלם') {
        updates.completedAt = null;
      }
      
      // עדכון המשימה
      await updateDoc(taskRef, updates);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Update task error:", error);
      return { success: false, error: error.message };
    }
  },

  // מחיקת משימה
  deleteTask: async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      
      // בדיקה אם המשימה קיימת
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error("משימה לא נמצאה");
      }
      
      // מחיקת המשימה
      await deleteDoc(taskRef);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Delete task error:", error);
      return { success: false, error: error.message };
    }
  },

  // קבלת משימה לפי מזהה
  getTask: async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        return { 
          task: { id: taskSnap.id, ...taskSnap.data() },
          error: null 
        };
      } else {
        throw new Error("משימה לא נמצאה");
      }
    } catch (error) {
      console.error("Get task error:", error);
      return { task: null, error: error.message };
    }
  },

  // קבלת משימות של משפחה
  getFamilyTasks: async (familyId, options = {}) => {
    try {
      const { status, assignedTo, sortBy = 'dueDate', sortDirection = 'asc', pageSize = 10, lastVisible = null } = options;
      
      // יצירת שאילתת בסיס
      let q = query(
        collection(db, "tasks"),
        where("familyId", "==", familyId)
      );
      
      // הוספת פילטר סטטוס אם צוין
      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      // הוספת פילטר איש קשר אם צוין
      if (assignedTo) {
        q = query(q, where("assignedTo.id", "==", assignedTo));
      }
      
      // הוספת מיון
      q = query(q, orderBy(sortBy, sortDirection));
      
      // הוספת דפדוף אם צוין
      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      
      // הגבלת מספר התוצאות
      q = query(q, limit(pageSize));
      
      // ביצוע השאילתה
      const querySnapshot = await getDocs(q);
      
      // בניית מערך התוצאות
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      // קביעת המסמך האחרון לדפדוף הבא
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { 
        tasks, 
        lastVisible: lastDoc || null,
        error: null 
      };
    } catch (error) {
      console.error("Get family tasks error:", error);
      return { tasks: [], lastVisible: null, error: error.message };
    }
  },

  // קבלת משימות שהוקצו למשתמש
  getUserTasks: async (userId, options = {}) => {
    try {
      const { status, familyId, sortBy = 'dueDate', sortDirection = 'asc', pageSize = 10, lastVisible = null } = options;
      
      // יצירת שאילתת בסיס
      let q = query(
        collection(db, "tasks"),
        where("assignedTo.id", "==", userId)
      );
      
      // הוספת פילטר משפחה אם צוין
      if (familyId) {
        q = query(q, where("familyId", "==", familyId));
      }
      
      // הוספת פילטר סטטוס אם צוין
      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      // הוספת מיון
      q = query(q, orderBy(sortBy, sortDirection));
      
      // הוספת דפדוף אם צוין
      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      
      // הגבלת מספר התוצאות
      q = query(q, limit(pageSize));
      
      // ביצוע השאילתה
      const querySnapshot = await getDocs(q);
      
      // בניית מערך התוצאות
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      // קביעת המסמך האחרון לדפדוף הבא
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { 
        tasks, 
        lastVisible: lastDoc || null,
        error: null 
      };
    } catch (error) {
      console.error("Get user tasks error:", error);
      return { tasks: [], lastVisible: null, error: error.message };
    }
  },

  // קבלת משימות שנוצרו על ידי משתמש
  getTasksCreatedByUser: async (userId, options = {}) => {
    try {
      const { status, familyId, sortBy = 'createdAt', sortDirection = 'desc', pageSize = 10, lastVisible = null } = options;
      
      // יצירת שאילתת בסיס
      let q = query(
        collection(db, "tasks"),
        where("createdBy.id", "==", userId)
      );
      
      // הוספת פילטר משפחה אם צוין
      if (familyId) {
        q = query(q, where("familyId", "==", familyId));
      }
      
      // הוספת פילטר סטטוס אם צוין
      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      // הוספת מיון
      q = query(q, orderBy(sortBy, sortDirection));
      
      // הוספת דפדוף אם צוין
      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      
      // הגבלת מספר התוצאות
      q = query(q, limit(pageSize));
      
      // ביצוע השאילתה
      const querySnapshot = await getDocs(q);
      
      // בניית מערך התוצאות
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      // קביעת המסמך האחרון לדפדוף הבא
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { 
        tasks, 
        lastVisible: lastDoc || null,
        error: null 
      };
    } catch (error) {
      console.error("Get tasks created by user error:", error);
      return { tasks: [], lastVisible: null, error: error.message };
    }
  },

  // קבלת משימות מתוזמנות לתזכורת בטווח זמן מסוים
  getScheduledReminders: async (startTime, endTime) => {
    try {
      // יצירת שאילתה להחזרת משימות שזמן התזכורת שלהן נמצא בטווח המבוקש
      const q = query(
        collection(db, "tasks"),
        where("reminder", ">=", startTime),
        where("reminder", "<=", endTime),
        where("status", "!=", "הושלם")
      );
      
      const querySnapshot = await getDocs(q);
      
      // בניית מערך התוצאות
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return { tasks, error: null };
    } catch (error) {
      console.error("Get scheduled reminders error:", error);
      return { tasks: [], error: error.message };
    }
  },

  // טיפול במשימות חוזרות
  handleRecurringTasks: async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      // איתור משימות חוזרות שמועד היצירה הבא שלהן הוא היום
      const q = query(
        collection(db, "tasks"),
        where("recurring.active", "==", true),
        where("recurring.nextOccurrence", ">=", startOfDay),
        where("recurring.nextOccurrence", "<=", endOfDay)
      );
      
      const querySnapshot = await getDocs(q);
      
      // יצירת משימות חדשות וחישוב המועד הבא
      const promises = [];
      
      querySnapshot.forEach((doc) => {
        const task = doc.data();
        
        // יצירת משימה חדשה זהה
        const newTask = {
          title: task.title,
          description: task.description,
          status: 'לביצוע',
          priority: task.priority,
          dueDate: task.recurring.nextOccurrence,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy,
          familyId: task.familyId,
          tags: task.tags || [],
          reminder: task.reminder ? new Date(task.recurring.nextOccurrence.getTime() - (task.dueDate.getTime() - task.reminder.getTime())) : null
        };
        
        // חישוב התאריך הבא לפי סוג המחזוריות
        let nextDate = new Date(task.recurring.nextOccurrence);
        
        switch(task.recurring.type) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          default:
            break;
        }
        
        // עדכון המשימה המקורית עם התאריך הבא
        const updatePromise = updateDoc(doc.ref, {
          'recurring.nextOccurrence': nextDate,
          updatedAt: serverTimestamp()
        });
        
        // יצירת המשימה החדשה
        const createPromise = taskService.createTask(newTask);
        
        promises.push(updatePromise);
        promises.push(createPromise);
      });
      
      await Promise.all(promises);
      
      return { success: true, count: querySnapshot.size, error: null };
    } catch (error) {
      console.error("Handle recurring tasks error:", error);
      return { success: false, count: 0, error: error.message };
    }
  }
}; 