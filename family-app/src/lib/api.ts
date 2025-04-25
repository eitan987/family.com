import axios from 'axios';

// הגדרת URL בסיסי מתוך משתני סביבה
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// יצירת מופע axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // מאפשר שליחת עוגיות עם הבקשות
});

// מכניס את הטוקן בכל בקשה יוצאת, אם קיים
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API עבור משימות
export const tasksAPI = {
  // קבלת כל המשימות
  getAll: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('שגיאה בקבלת משימות:', error);
      throw error;
    }
  },
  
  // קבלת משימה בודדת לפי מזהה
  getById: async (taskId: string) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בקבלת משימה ${taskId}:`, error);
      throw error;
    }
  },
  
  // יצירת משימה חדשה
  create: async (taskData: any) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('שגיאה ביצירת משימה:', error);
      throw error;
    }
  },
  
  // עדכון משימה קיימת
  update: async (taskId: string, taskData: any) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בעדכון משימה ${taskId}:`, error);
      throw error;
    }
  },
  
  // שינוי סטטוס משימה
  toggleStatus: async (taskId: string, isCompleted: boolean) => {
    try {
      const status = isCompleted ? 'הושלם' : 'לביצוע';
      const response = await api.put(`/tasks/${taskId}`, { status });
      return response.data;
    } catch (error) {
      console.error(`שגיאה בשינוי סטטוס משימה ${taskId}:`, error);
      throw error;
    }
  },
  
  // מחיקת משימה
  delete: async (taskId: string) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה במחיקת משימה ${taskId}:`, error);
      throw error;
    }
  }
};

// API עבור מסמכים
export const documentsAPI = {
  // קבלת כל המסמכים
  getAll: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('שגיאה בקבלת מסמכים:', error);
      throw error;
    }
  },
  
  // קבלת מסמך בודד לפי מזהה
  getById: async (documentId: string) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בקבלת מסמך ${documentId}:`, error);
      throw error;
    }
  },
  
  // העלאת מסמך חדש
  upload: async (formData: FormData) => {
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('שגיאה בהעלאת מסמך:', error);
      throw error;
    }
  },
  
  // עדכון פרטי מסמך
  update: async (documentId: string, documentData: any) => {
    try {
      const response = await api.put(`/documents/${documentId}`, documentData);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בעדכון מסמך ${documentId}:`, error);
      throw error;
    }
  },
  
  // מחיקת מסמך
  delete: async (documentId: string) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה במחיקת מסמך ${documentId}:`, error);
      throw error;
    }
  }
};

// API עבור אימות ומשתמשים
export const authAPI = {
  // התחברות
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // שמירת הטוקן בלוקל סטורג'
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      throw error;
    }
  },
  
  // התנתקות
  logout: async () => {
    try {
      await api.get('/auth/logout');
      
      // מחיקת הטוקן מהלוקל סטורג'
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      
      return { success: true };
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
      throw error;
    }
  },
  
  // קבלת פרטי המשתמש המחובר
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('שגיאה בקבלת פרטי משתמש:', error);
      throw error;
    }
  },
  
  // עדכון פרטי משתמש
  updateUserDetails: async (userData: any) => {
    try {
      const response = await api.put('/auth/updatedetails', userData);
      
      // עדכון המשתמש בלוקל סטורג'
      if (response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('שגיאה בעדכון פרטי משתמש:', error);
      throw error;
    }
  },
  
  // שינוי סיסמה
  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/auth/updatepassword', {
        currentPassword,
        newPassword,
      });
      
      return response.data;
    } catch (error) {
      console.error('שגיאה בשינוי סיסמה:', error);
      throw error;
    }
  },
};

export default api; 