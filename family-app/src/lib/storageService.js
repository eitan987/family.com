import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { storage, auth } from './firebaseConfig';

/**
 * שירות לטיפול בקבצים ב-Firebase Storage
 */
const storageService = {
  /**
   * העלאת קובץ ל-Storage
   * @param {File} file - קובץ להעלאה
   * @param {string} path - נתיב בתוך ה-Storage
   * @param {function} progressCallback - פונקציה שתופעל בכל עדכון בהתקדמות ההעלאה
   * @returns {Promise<Object>} - מידע על הקובץ שהועלה, כולל URL להורדה
   */
  async uploadFile(file, path, progressCallback = null) {
    try {
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const fullPath = path ? `${path}/${fileName}` : fileName;
      
      const storageRef = ref(storage, fullPath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressCallback) {
              progressCallback(progress);
            }
          },
          (error) => {
            console.error('שגיאה בהעלאת קובץ:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await getMetadata(uploadTask.snapshot.ref);
              
              resolve({
                name: file.name,
                originalName: file.name,
                fileName: fileName,
                fullPath: fullPath,
                size: file.size,
                contentType: file.type,
                downloadURL,
                createdAt: new Date().toISOString(),
                metadata
              });
            } catch (error) {
              console.error('שגיאה בקבלת URL להורדה:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('שגיאה בהעלאת קובץ:', error);
      throw error;
    }
  },
  
  /**
   * העלאת תמונת פרופיל
   * @param {File} file - קובץ התמונה להעלאה
   * @param {string} userId - מזהה המשתמש
   * @param {function} progressCallback - פונקציה לטיפול בהתקדמות ההעלאה
   * @returns {Promise<string>} - URL להורדת התמונה
   */
  async uploadProfileImage(file, userId, progressCallback = null) {
    try {
      const result = await this.uploadFile(file, `profile_images/${userId}`, progressCallback);
      return result.downloadURL;
    } catch (error) {
      console.error('שגיאה בהעלאת תמונת פרופיל:', error);
      throw error;
    }
  },
  
  /**
   * העלאת מסמך משפחתי
   * @param {File} file - קובץ המסמך להעלאה
   * @param {string} familyId - מזהה המשפחה
   * @param {function} progressCallback - פונקציה לטיפול בהתקדמות ההעלאה
   * @returns {Promise<Object>} - מידע על המסמך שהועלה
   */
  async uploadFamilyDocument(file, familyId, progressCallback = null) {
    try {
      return await this.uploadFile(file, `families/${familyId}/documents`, progressCallback);
    } catch (error) {
      console.error('שגיאה בהעלאת מסמך משפחתי:', error);
      throw error;
    }
  },
  
  /**
   * קבלת URL להורדה עבור קובץ
   * @param {string} path - נתיב הקובץ בתוך ה-Storage
   * @returns {Promise<string>} - URL להורדה
   */
  async getFileDownloadURL(path) {
    try {
      const fileRef = ref(storage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('שגיאה בקבלת URL לקובץ:', error);
      throw error;
    }
  },
  
  /**
   * מחיקת קובץ מה-Storage
   * @param {string} path - נתיב הקובץ למחיקה
   * @returns {Promise<void>}
   */
  async deleteFile(path) {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('שגיאה במחיקת קובץ:', error);
      throw error;
    }
  },
  
  /**
   * קבלת רשימת קבצים מתיקייה
   * @param {string} folderPath - נתיב התיקייה
   * @returns {Promise<Array>} - מערך של פרטי הקבצים
   */
  async listFiles(folderPath) {
    try {
      const folderRef = ref(storage, folderPath);
      const fileList = await listAll(folderRef);
      
      const files = await Promise.all(
        fileList.items.map(async (itemRef) => {
          try {
            const url = await getDownloadURL(itemRef);
            const metadata = await getMetadata(itemRef);
            
            return {
              name: itemRef.name,
              fullPath: itemRef.fullPath,
              downloadURL: url,
              contentType: metadata.contentType,
              size: metadata.size,
              timeCreated: metadata.timeCreated,
              updated: metadata.updated,
              metadata
            };
          } catch (error) {
            console.error(`שגיאה בקבלת מידע על הקובץ ${itemRef.name}:`, error);
            return {
              name: itemRef.name,
              fullPath: itemRef.fullPath,
              error: error.message
            };
          }
        })
      );
      
      return files;
    } catch (error) {
      console.error('שגיאה בקבלת רשימת קבצים:', error);
      throw error;
    }
  }
};

export default storageService; 