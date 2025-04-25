import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

/**
 * תצורת Firebase למערכת family-app
 * 
 * מכיל את פרטי ההתחברות וההגדרות לשירותי Firebase השונים
 */

// פרטי התצורה לחיבור עם Firebase
// במקרה צורך - החלף את הפרטים בפרטי הפרויקט שלך
const firebaseConfig = {
  apiKey: "AIzaSyATLUKuiVcEYT0z-I9aXVsKOiBR4Oe_aS0",
  authDomain: "family-app-2023.firebaseapp.com",
  projectId: "family-app-2023",
  storageBucket: "family-app-2023.appspot.com",
  messagingSenderId: "374761966843",
  appId: "1:374761966843:web:b1dc69232f7ef1b9987a78"
};

// אתחול אפליקציית Firebase
const app = initializeApp(firebaseConfig);

// ייצוא השירותים השונים של Firebase לשימוש ברחבי האפליקציה
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, db, storage, functions }; 