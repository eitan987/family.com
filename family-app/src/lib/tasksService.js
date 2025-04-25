import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * שירות לניהול משימות משפחתיות
 * מאפשר יצירה, עדכון, מחיקה וקבלה של משימות עבור משפחה
 */

// קבלת כל המשימות של משפחה מסוימת
export const getFamilyTasks = async (familyId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('familyId', '==', familyId),
      orderBy('dueDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting family tasks:', error);
    throw error;
  }
};

// קבלת משימות מסוננות לפי סטטוס
export const getTasksByStatus = async (familyId, status) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('familyId', '==', familyId),
      where('status', '==', status),
      orderBy('dueDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks by status:', error);
    throw error;
  }
};

// קבלת משימות מסוננות לפי משתמש
export const getTasksByAssignee = async (familyId, userId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('familyId', '==', familyId),
      where('assignedTo.userId', '==', userId),
      orderBy('dueDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks by assignee:', error);
    throw error;
  }
};

// יצירת משימה חדשה
export const createTask = async (taskData) => {
  try {
    const taskWithTimestamp = {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'tasks'), taskWithTimestamp);
    return {
      id: docRef.id,
      ...taskWithTimestamp
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// עדכון משימה קיימת
export const updateTask = async (taskId, taskData) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    
    // אם עודכן הסטטוס ל"הושלם", הוסף תאריך השלמה
    if (taskData.status === 'הושלם' && !taskData.completedAt) {
      taskData.completedAt = new Date();
    }
    
    // אם עודכן הסטטוס ל"לביצוע" או "בתהליך", נקה את תאריך ההשלמה
    if (taskData.status !== 'הושלם') {
      taskData.completedAt = null;
    }
    
    const updatedData = {
      ...taskData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(taskRef, updatedData);
    
    // קבל את המשימה המעודכנת
    const updatedTaskDoc = await getDoc(taskRef);
    return {
      id: updatedTaskDoc.id,
      ...updatedTaskDoc.data()
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// מחיקת משימה
export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    return taskId;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// קבלת פרטי משימה לפי מזהה
export const getTaskById = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      return {
        id: taskDoc.id,
        ...taskDoc.data()
      };
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
};

// סימון משימה כהושלמה
export const completeTask = async (taskId, completedBy) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    
    await updateDoc(taskRef, {
      status: 'הושלם',
      completedAt: new Date(),
      completedBy,
      updatedAt: serverTimestamp()
    });
    
    const updatedTaskDoc = await getDoc(taskRef);
    return {
      id: updatedTaskDoc.id,
      ...updatedTaskDoc.data()
    };
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

// קבלת משימות לפי מזהה משפחה
export const getTasksByFamilyId = async (familyId, filters = {}) => {
  try {
    let q = query(
      collection(db, 'tasks'),
      where('familyId', '==', familyId)
    );
    
    // הוספת מסננים אופציונליים
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.assignedTo) {
      q = query(q, where('assignedTo.id', '==', filters.assignedTo));
    }
    
    if (filters.priority) {
      q = query(q, where('priority', '==', filters.priority));
    }
    
    // מיון משימות
    const orderByField = filters.orderBy || 'dueDate';
    const orderDirection = filters.orderDirection || 'asc';
    q = query(q, orderBy(orderByField, orderDirection));
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

// האזנה בזמן אמת לשינויים במשימות של משפחה
export const subscribeToFamilyTasks = (familyId, callback) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('familyId', '==', familyId),
      orderBy('dueDate', 'asc')
    );
    
    // הרשמה לעדכונים בזמן אמת
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      callback(tasks);
    }, (error) => {
      console.error('Error in tasks subscription:', error);
    });
    
    // החזרת פונקציה לביטול ההרשמה
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to tasks:', error);
    throw error;
  }
};

// קבלת משימות שיש להן תזכורות בטווח זמן מסוים
export const getTasksWithReminders = async (familyId, startTime, endTime) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('familyId', '==', familyId),
      where('reminder', '>=', startTime),
      where('reminder', '<=', endTime),
      where('status', '!=', 'הושלם')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks with reminders:', error);
    throw error;
  }
};

// קבלת כמות המשימות לפי סטטוס
export const getTasksCountByStatus = async (familyId) => {
  try {
    const statuses = ['לביצוע', 'בתהליך', 'הושלם'];
    const counts = {};
    
    // ביצוע שאילתה עבור כל סטטוס
    for (const status of statuses) {
      const q = query(
        collection(db, 'tasks'),
        where('familyId', '==', familyId),
        where('status', '==', status)
      );
      
      const querySnapshot = await getDocs(q);
      counts[status] = querySnapshot.size;
    }
    
    return counts;
  } catch (error) {
    console.error('Error getting tasks count by status:', error);
    throw error;
  }
}; 