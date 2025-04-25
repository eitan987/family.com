import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// שירותי אימות עם Firebase
export const firebaseAuth = {
  // הרשמת משתמש חדש
  register: async (firstName, lastName, email, password) => {
    try {
      // יצירת משתמש בשירות האימות
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // עדכון שם המשתמש בפרופיל
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // יצירת משפחה חדשה
      const familyRef = doc(collection(db, "families"));
      await setDoc(familyRef, {
        lastName,
        createdBy: user.uid,
        createdAt: new Date(),
        members: [user.uid]
      });

      // שמירת נתוני המשתמש במסד הנתונים
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        role: 'הורה',
        familyId: familyRef.id,
        isAdmin: true,
        createdAt: new Date()
      });

      return {
        user: {
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          role: 'הורה',
          familyId: familyRef.id
        }
      };
    } catch (error) {
      console.error('שגיאה בהרשמה:', error);
      throw error;
    }
  },

  // התחברות
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // קבלת נתוני המשתמש מ-Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      // אם אין נתונים במסד הנתונים, יוצרים רשומה בסיסית
      if (!userDoc.exists()) {
        const nameParts = user.displayName ? user.displayName.split(' ') : ['משתמש', 'חדש'];
        const userData = {
          firstName: nameParts[0],
          lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
          email: user.email || '',
          role: 'הורה',
          createdAt: new Date()
        };
        
        await setDoc(doc(db, "users", user.uid), userData);
        
        return {
          user: {
            uid: user.uid,
            email: user.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
          }
        };
      }
      
      const userData = userDoc.data();

      return {
        user: {
          uid: user.uid,
          email: user.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          familyId: userData.familyId
        }
      };
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      throw error;
    }
  },

  // התנתקות
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
      throw error;
    }
  },

  // קבלת משתמש נוכחי
  getCurrentUser: async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // אם אין נתונים, מחזירים אוביקט משתמש בסיסי
        return {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || 'משתמש',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || 'חדש',
          role: 'הורה'
        };
      }
      
      const userData = userDoc.data();

      return {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        familyId: userData.familyId
      };
    } catch (error) {
      console.error('שגיאה בקבלת פרטי משתמש:', error);
      throw error;
    }
  },

  // עדכון פרטי משתמש
  updateUserDetails: async (userData) => {
    const user = auth.currentUser;
    if (!user) throw new Error('לא מחובר');

    try {
      // עדכון הפרופיל באימות
      if (userData.firstName && userData.lastName) {
        await updateProfile(user, {
          displayName: `${userData.firstName} ${userData.lastName}`
        });
      }

      // עדכון הנתונים ב-Firestore
      await updateDoc(doc(db, "users", user.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      });

      // קבלת הנתונים המעודכנים
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const updatedData = userDoc.data();

      return {
        uid: user.uid,
        email: user.email,
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        role: updatedData.role,
        familyId: updatedData.familyId,
        phone: updatedData.phone
      };
    } catch (error) {
      console.error('שגיאה בעדכון פרטי משתמש:', error);
      throw error;
    }
  },

  // שינוי סיסמה
  updatePassword: async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    if (!user) throw new Error('לא מחובר');
    if (!user.email) throw new Error('המשתמש אינו מחובר באמצעות אימייל וסיסמה');

    try {
      // אימות המשתמש מחדש לפני שינוי הסיסמה
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // עדכון הסיסמה
      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error) {
      console.error('שגיאה בשינוי סיסמה:', error);
      throw error;
    }
  },

  // שחזור סיסמה
  forgotPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('שגיאה בשליחת אימייל לאיפוס סיסמה:', error);
      throw error;
    }
  },

  // הצטרפות למשפחה קיימת
  joinFamily: async (familyId, inviteCode) => {
    const user = auth.currentUser;
    if (!user) throw new Error('לא מחובר');

    try {
      // בדיקה אם המשפחה קיימת והקוד תקין
      const familyDoc = await getDoc(doc(db, "families", familyId));
      
      if (!familyDoc.exists()) {
        throw new Error('משפחה לא נמצאה');
      }
      
      const familyData = familyDoc.data();
      
      if (familyData.inviteCode !== inviteCode) {
        throw new Error('קוד הזמנה לא תקין');
      }

      // עדכון משפחה עם המשתמש החדש
      await updateDoc(doc(db, "families", familyId), {
        members: [...familyData.members, user.uid]
      });

      // עדכון המשתמש עם המשפחה החדשה
      await updateDoc(doc(db, "users", user.uid), {
        familyId: familyId,
        isAdmin: false
      });

      return { success: true };
    } catch (error) {
      console.error('שגיאה בהצטרפות למשפחה:', error);
      throw error;
    }
  },

  // יצירת קוד הזמנה למשפחה
  createFamilyInviteCode: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('לא מחובר');

    try {
      // קבלת פרטי המשתמש
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData.isAdmin) {
        throw new Error('רק מנהל משפחה יכול ליצור קוד הזמנה');
      }

      // יצירת קוד הזמנה אקראי
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // שמירת הקוד במשפחה
      await updateDoc(doc(db, "families", userData.familyId), {
        inviteCode: inviteCode
      });

      return { inviteCode };
    } catch (error) {
      console.error('שגיאה ביצירת קוד הזמנה:', error);
      throw error;
    }
  }
}; 