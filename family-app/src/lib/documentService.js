import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata
} from "firebase/storage";
import { db, storage } from "./firebaseConfig";

const documentService = {
  // העלאת קובץ למאגר
  uploadDocument: async (file, metadata) => {
    try {
      if (!file) {
        throw new Error("לא נבחר קובץ");
      }
      
      const { familyId, folderId, description, tags } = metadata;
      
      // יצירת מזהה ייחודי לקובץ
      const uniqueFileName = `${Date.now()}_${file.name}`;
      
      // יצירת הנתיב לאחסון הקובץ
      const storagePath = `families/${familyId}/${folderId || 'general'}/${uniqueFileName}`;
      const storageRef = ref(storage, storagePath);
      
      // העלאת הקובץ לאחסון
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // יצירת Promise לפעולת ההעלאה
      const uploadPromise = new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          // פונקציית התקדמות
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("התקדמות העלאה: " + progress + "%");
          },
          // פונקציית שגיאה
          (error) => {
            console.error("שגיאת העלאה: ", error);
            reject(error);
          },
          // פונקציית סיום מוצלח
          async () => {
            try {
              // קבלת הלינק להורדת הקובץ
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // קבלת מטה-דאטה של הקובץ
              const fileMetadata = await getMetadata(uploadTask.snapshot.ref);
              
              // יצירת רשומה במסד הנתונים
              const docData = {
                name: file.name,
                path: storagePath,
                url: downloadURL,
                type: file.type,
                size: file.size,
                contentType: fileMetadata.contentType,
                familyId,
                folderId: folderId || 'general',
                description: description || '',
                tags: tags || [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };
              
              const docRef = await addDoc(collection(db, "documents"), docData);
              
              resolve({
                id: docRef.id,
                ...docData,
                progress: 100,
                error: null
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
      
      return await uploadPromise;
    } catch (error) {
      console.error("שגיאה בהעלאת קובץ:", error);
      return { error: error.message };
    }
  },
  
  // קבלת מסמך לפי מזהה
  getDocument: async (documentId) => {
    try {
      const docRef = doc(db, "documents", documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          document: { id: docSnap.id, ...docSnap.data() },
          error: null 
        };
      } else {
        throw new Error("מסמך לא נמצא");
      }
    } catch (error) {
      console.error("שגיאה בקבלת מסמך:", error);
      return { document: null, error: error.message };
    }
  },
  
  // קבלת רשימת מסמכים של משפחה
  getFamilyDocuments: async (familyId, options = {}) => {
    try {
      const { folderId, type, sortBy = 'createdAt', sortDirection = 'desc', pageSize = 20, lastVisible = null } = options;
      
      // יצירת שאילתת בסיס
      let q = query(
        collection(db, "documents"),
        where("familyId", "==", familyId)
      );
      
      // הוספת פילטר תיקייה אם צוין
      if (folderId) {
        q = query(q, where("folderId", "==", folderId));
      }
      
      // הוספת פילטר סוג מסמך אם צוין
      if (type) {
        q = query(q, where("type", "==", type));
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
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      // קביעת המסמך האחרון לדפדוף הבא
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { 
        documents, 
        lastVisible: lastDoc || null,
        error: null 
      };
    } catch (error) {
      console.error("שגיאה בקבלת מסמכים:", error);
      return { documents: [], lastVisible: null, error: error.message };
    }
  },
  
  // חיפוש מסמכים
  searchDocuments: async (familyId, searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error("יש להזין מילות חיפוש");
      }
      
      // קבלת כל המסמכים של המשפחה
      const q = query(
        collection(db, "documents"),
        where("familyId", "==", familyId),
        orderBy("name"),
        limit(100)  // הגבלה מחמירה למקרה הצורך
      );
      
      const querySnapshot = await getDocs(q);
      
      // סינון מקומי לפי מילות החיפוש
      // שימוש בפונקציה זו במקום שאילתות מורכבות מכיוון ש-Firestore לא תומך בחיפוש טקסט מלא
      const searchTermLower = searchTerm.toLowerCase();
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const nameMatch = data.name.toLowerCase().includes(searchTermLower);
        const descMatch = data.description && data.description.toLowerCase().includes(searchTermLower);
        const tagMatch = data.tags && data.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
        
        if (nameMatch || descMatch || tagMatch) {
          documents.push({ id: doc.id, ...data });
        }
      });
      
      return { documents, error: null };
    } catch (error) {
      console.error("שגיאה בחיפוש מסמכים:", error);
      return { documents: [], error: error.message };
    }
  },
  
  // עדכון מסמך
  updateDocument: async (documentId, updateData) => {
    try {
      const docRef = doc(db, "documents", documentId);
      
      // בדיקה אם המסמך קיים
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("מסמך לא נמצא");
      }
      
      // הוספת timestamp עדכון
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      // עדכון המסמך
      await updateDoc(docRef, updates);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("שגיאה בעדכון מסמך:", error);
      return { success: false, error: error.message };
    }
  },
  
  // מחיקת מסמך
  deleteDocument: async (documentId) => {
    try {
      const docRef = doc(db, "documents", documentId);
      
      // בדיקה אם המסמך קיים
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("מסמך לא נמצא");
      }
      
      const documentData = docSnap.data();
      
      // מחיקת הקובץ מהאחסון
      const storageRef = ref(storage, documentData.path);
      await deleteObject(storageRef);
      
      // מחיקת הרשומה ממסד הנתונים
      await deleteDoc(docRef);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("שגיאה במחיקת מסמך:", error);
      return { success: false, error: error.message };
    }
  },
  
  // יצירת תיקייה חדשה
  createFolder: async (familyId, folderName, parentFolderId = null) => {
    try {
      const folderData = {
        name: folderName,
        familyId,
        parentFolderId,
        type: 'folder',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const folderRef = await addDoc(collection(db, "folders"), folderData);
      
      return { 
        folder: { id: folderRef.id, ...folderData },
        error: null 
      };
    } catch (error) {
      console.error("שגיאה ביצירת תיקייה:", error);
      return { folder: null, error: error.message };
    }
  },
  
  // קבלת רשימת תיקיות של משפחה
  getFamilyFolders: async (familyId, parentFolderId = null) => {
    try {
      let q;
      
      if (parentFolderId === null) {
        // קבלת תיקיות שורש
        q = query(
          collection(db, "folders"),
          where("familyId", "==", familyId),
          where("parentFolderId", "==", null)
        );
      } else {
        // קבלת תיקיות בתוך תיקיית הורה
        q = query(
          collection(db, "folders"),
          where("familyId", "==", familyId),
          where("parentFolderId", "==", parentFolderId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const folders = [];
      querySnapshot.forEach((doc) => {
        folders.push({ id: doc.id, ...doc.data() });
      });
      
      return { folders, error: null };
    } catch (error) {
      console.error("שגיאה בקבלת תיקיות:", error);
      return { folders: [], error: error.message };
    }
  },
  
  // מחיקת תיקייה
  deleteFolder: async (folderId) => {
    try {
      const folderRef = doc(db, "folders", folderId);
      
      // בדיקה אם התיקייה קיימת
      const folderSnap = await getDoc(folderRef);
      if (!folderSnap.exists()) {
        throw new Error("תיקייה לא נמצאה");
      }
      
      const folderData = folderSnap.data();
      
      // בדיקה אם יש תיקיות משנה
      const subFoldersQuery = query(
        collection(db, "folders"),
        where("parentFolderId", "==", folderId)
      );
      
      const subFoldersSnapshot = await getDocs(subFoldersQuery);
      if (!subFoldersSnapshot.empty) {
        throw new Error("לא ניתן למחוק תיקייה שמכילה תיקיות משנה");
      }
      
      // בדיקה אם יש מסמכים בתיקייה
      const documentsQuery = query(
        collection(db, "documents"),
        where("folderId", "==", folderId)
      );
      
      const documentsSnapshot = await getDocs(documentsQuery);
      if (!documentsSnapshot.empty) {
        throw new Error("לא ניתן למחוק תיקייה שמכילה מסמכים");
      }
      
      // מחיקת התיקייה
      await deleteDoc(folderRef);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("שגיאה במחיקת תיקייה:", error);
      return { success: false, error: error.message };
    }
  }
};

export default documentService; 