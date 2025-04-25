import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

/**
 * שירות אימות והרשמת משתמשים עבור אפליקציית המשפחה
 * מאפשר הרשמה, התחברות, שינוי פרטים, איפוס סיסמה וניהול משפחות
 */

/**
 * שירות לניהול משתמשים ותהליכי אימות
 */
export const authService = {
  /**
   * האזנה לשינויים במצב החיבור של המשתמש
   * @param {Function} callback - פונקציה שתופעל בכל שינוי במצב
   * @returns {Function} - פונקציה להפסקת ההאזנה
   */
  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  },

  /**
   * הרשמה עם אימייל וסיסמה
   * @param {string} email - כתובת אימייל
   * @param {string} password - סיסמה
   * @param {string} displayName - שם להצגה
   * @returns {Promise<Object>} - פרטי המשתמש
   */
  registerWithEmail: async (email, password, displayName) => {
    try {
      // יצירת משתמש חדש
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // עדכון שם תצוגה
      await updateProfile(user, {
        displayName: displayName
      });

      // יצירת מסמך משתמש בפיירסטור
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        createdAt: new Date(),
        familyId: null, // יוגדר כשהמשתמש ייצור או יצטרף למשפחה
        role: 'member'
      });

      return user;
    } catch (error) {
      console.error('שגיאה בהרשמה:', error);
      throw error;
    }
  },

  /**
   * התחברות עם אימייל וסיסמה
   * @param {string} email - כתובת אימייל
   * @param {string} password - סיסמה
   * @returns {Promise<Object>} - פרטי המשתמש
   */
  loginWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      throw error;
    }
  },

  /**
   * התחברות עם חשבון גוגל
   * @returns {Promise<Object>} - פרטי המשתמש
   */
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // בדיקה אם המשתמש קיים במערכת
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      // אם המשתמש לא קיים, יצירת מסמך חדש
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          familyId: null,
          role: 'member'
        });
      }
      
      return user;
    } catch (error) {
      console.error('שגיאה בהתחברות עם Google:', error);
      throw error;
    }
  },

  /**
   * התנתקות מהמערכת
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await firebaseSignOut(auth);
      return true;
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
      throw error;
    }
  },

  /**
   * שליחת אימייל לאיפוס סיסמה
   * @param {string} email - כתובת אימייל
   * @returns {Promise<void>}
   */
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('שגיאה בשליחת איפוס סיסמה:', error);
      throw error;
    }
  },

  /**
   * עדכון פרטי משתמש
   * @param {Object} userData - נתוני המשתמש לעדכון
   * @returns {Promise<void>}
   */
  updateUserProfile: async (userData) => {
    if (!auth.currentUser) {
      throw new Error('המשתמש אינו מחובר');
    }

    try {
      const user = auth.currentUser;
      
      // עדכון פרטים בשירות האימות
      if (userData.displayName || userData.photoURL) {
        await updateProfile(user, {
          displayName: userData.displayName || user.displayName,
          photoURL: userData.photoURL || user.photoURL
        });
      }
      
      // עדכון פרטים בפיירסטור
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, userData);
      
      return true;
    } catch (error) {
      console.error('שגיאה בעדכון פרופיל:', error);
      throw error;
    }
  },

  /**
   * קבלת פרטי משתמש נוכחי
   * @returns {Promise<Object>} - פרטי המשתמש
   */
  getCurrentUserData: async () => {
    if (!auth.currentUser) {
      return null;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return {
          ...userDoc.data(),
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL
        };
      }
      
      return null;
    } catch (error) {
      console.error('שגיאה בקבלת פרטי משתמש:', error);
      throw error;
    }
  },

  // התחברות משתמש קיים
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { user: null, error: error.message };
    }
  },

  // הרשמת משתמש חדש
  register: async (email, password, displayName) => {
    try {
      // יצירת המשתמש ב-Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // עדכון שם התצוגה
      await updateProfile(user, { displayName });
      
      // שליחת אימות מייל
      await sendEmailVerification(user);
      
      // יצירת מסמך משתמש ב-Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        families: [],
        invites: []
      });
      
      return { user, error: null };
    } catch (error) {
      console.error("Registration error:", error);
      return { user: null, error: error.message };
    }
  },

  // איפוס סיסמה
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      console.error("Password reset error:", error);
      return { error: error.message };
    }
  },

  // עדכון אימייל
  updateUserEmail: async (newEmail, password) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      
      // אימות מחדש של המשתמש
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // עדכון האימייל
      await updateEmail(user, newEmail);
      
      // עדכון האימייל גם ב-Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { email: newEmail });
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Email update error:", error);
      return { success: false, error: error.message };
    }
  },

  // עדכון סיסמה
  updateUserPassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      
      // אימות מחדש של המשתמש
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // עדכון הסיסמה
      await updatePassword(user, newPassword);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Password update error:", error);
      return { success: false, error: error.message };
    }
  },

  // קבלת המשתמש הנוכחי
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // קבלת פרטי המשתמש המלאים מ-Firestore
  getUserData: async (userId = null) => {
    try {
      const uid = userId || auth.currentUser?.uid;
      if (!uid) throw new Error("No user ID provided");
      
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { userData: { id: userSnap.id, ...userSnap.data() }, error: null };
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Get user data error:", error);
      return { userData: null, error: error.message };
    }
  },

  /**
   * הרשמה למערכת עם אימייל וסיסמה
   * @param {string} email - כתובת אימייל
   * @param {string} password - סיסמה
   * @param {Object} userData - נתוני משתמש נוספים (שם, תמונה, וכו')
   * @returns {Promise<Object>} - אובייקט המשתמש שנוצר
   */
  async register(email, password, userData) {
    try {
      // יצירת המשתמש ב-Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // עדכון פרופיל המשתמש
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName,
          photoURL: userData.photoURL || null
        });
      }
      
      // יצירת מסמך משתמש ב-Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        role: userData.role || 'member',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        ...userData
      });
      
      return user;
    } catch (error) {
      console.error('שגיאה בהרשמה:', error);
      throw error;
    }
  },
  
  /**
   * התחברות למערכת עם אימייל וסיסמה
   * @param {string} email - כתובת אימייל
   * @param {string} password - סיסמה
   * @returns {Promise<Object>} - אובייקט המשתמש המחובר
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // עדכון תאריך התחברות אחרון
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      throw error;
    }
  },
  
  /**
   * עדכון פרטי פרופיל של המשתמש
   * @param {Object} profileData - הנתונים לעדכון
   * @returns {Promise<void>}
   */
  async updateUserProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('אין משתמש מחובר');
      
      // עדכון נתוני Firebase Auth
      const authUpdates = {};
      if (profileData.displayName) authUpdates.displayName = profileData.displayName;
      if (profileData.photoURL) authUpdates.photoURL = profileData.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }
      
      // עדכון נתוני Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('שגיאה בעדכון פרופיל:', error);
      throw error;
    }
  },
  
  /**
   * עדכון כתובת אימייל של המשתמש
   * @param {string} newEmail - כתובת האימייל החדשה
   * @param {string} password - הסיסמה הנוכחית לאימות
   * @returns {Promise<void>}
   */
  async updateUserEmail(newEmail, password) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('אין משתמש מחובר');
      
      // אימות מחדש של המשתמש
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // עדכון האימייל
      await updateEmail(user, newEmail);
      
      // עדכון האימייל ב-Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        email: newEmail,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('שגיאה בעדכון אימייל:', error);
      throw error;
    }
  },
  
  /**
   * שינוי סיסמה של המשתמש
   * @param {string} currentPassword - הסיסמה הנוכחית
   * @param {string} newPassword - הסיסמה החדשה
   * @returns {Promise<void>}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('אין משתמש מחובר');
      
      // אימות מחדש של המשתמש
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // עדכון הסיסמה
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('שגיאה בשינוי סיסמה:', error);
      throw error;
    }
  }
};

export default authService; 