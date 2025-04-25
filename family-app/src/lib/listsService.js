import { db, storage } from './firebaseConfig';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';

/**
 * שירות לניהול רשימות ב-Firebase
 * 
 * שירות זה מאפשר ניהול של רשימות מסוגים שונים במערכת.
 * ניתן להשתמש בו כדי ליצור, לעדכן ולמחוק רשימות וכן לשייך אותן למשפחות ולמשתמשים.
 */

/**
 * פונקציה ליצירת רשימה חדשה
 * @param {Object} listData - נתוני הרשימה
 * @param {string} familyId - מזהה המשפחה
 * @returns {Promise<string>} - מזהה הרשימה החדשה
 */
export const createList = async (listData, familyId) => {
  try {
    // הוספת שדות נוספים
    const listWithMeta = {
      ...listData,
      familyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      items: listData.items || []
    };

    // הוספת הרשימה למסד הנתונים
    const listsRef = collection(db, 'lists');
    const docRef = await addDoc(listsRef, listWithMeta);
    
    // עדכון מזהה המשפחה עם הרשימה החדשה
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, {
      lists: arrayUnion(docRef.id)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

/**
 * פונקציה לקבלת רשימה לפי מזהה
 * @param {string} listId - מזהה הרשימה
 * @returns {Promise<Object>} - נתוני הרשימה
 */
export const getListById = async (listId) => {
  try {
    const listRef = doc(db, 'lists', listId);
    const listSnap = await getDoc(listRef);
    
    if (listSnap.exists()) {
      return { id: listSnap.id, ...listSnap.data() };
    } else {
      throw new Error('List not found');
    }
  } catch (error) {
    console.error('Error getting list:', error);
    throw error;
  }
};

/**
 * פונקציה לקבלת כל הרשימות של משפחה
 * @param {string} familyId - מזהה המשפחה
 * @returns {Promise<Array>} - מערך של רשימות
 */
export const getFamilyLists = async (familyId) => {
  try {
    const listsRef = collection(db, 'lists');
    const q = query(
      listsRef, 
      where('familyId', '==', familyId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting family lists:', error);
    throw error;
  }
};

/**
 * פונקציה לקבלת רשימות לפי סוג
 * @param {string} familyId - מזהה המשפחה
 * @param {string} type - סוג הרשימה ('shopping', 'cleaning', 'general')
 * @returns {Promise<Array>} - מערך של רשימות מסוג מסוים
 */
export const getListsByType = async (familyId, type) => {
  try {
    const listsRef = collection(db, 'lists');
    const q = query(
      listsRef, 
      where('familyId', '==', familyId),
      where('type', '==', type),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting lists by type:', error);
    throw error;
  }
};

/**
 * פונקציה לקבלת רשימות של משתמש ספציפי
 * @param {string} familyId - מזהה המשפחה
 * @param {string} userId - מזהה המשתמש
 * @returns {Promise<Array>} - מערך של רשימות משויכות למשתמש
 */
export const getUserLists = async (familyId, userId) => {
  try {
    const listsRef = collection(db, 'lists');
    const q = query(
      listsRef, 
      where('familyId', '==', familyId),
      where('assignedTo', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user lists:', error);
    throw error;
  }
};

/**
 * פונקציה לעדכון רשימה
 * @param {string} listId - מזהה הרשימה
 * @param {Object} updateData - נתונים לעדכון
 * @returns {Promise<void>}
 */
export const updateList = async (listId, updateData) => {
  try {
    const listRef = doc(db, 'lists', listId);
    
    // הוספת זמן עדכון
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(listRef, dataToUpdate);
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

/**
 * פונקציה להוספת פריט לרשימה
 * @param {string} listId - מזהה הרשימה
 * @param {Object} item - פריט חדש
 * @returns {Promise<void>}
 */
export const addItemToList = async (listId, item) => {
  try {
    const listRef = doc(db, 'lists', listId);
    
    // הוספת מזהה ונתונים נוספים לפריט
    const itemWithId = {
      ...item,
      id: Date.now().toString(),
      completed: false,
      createdAt: serverTimestamp()
    };
    
    await updateDoc(listRef, {
      items: arrayUnion(itemWithId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding item to list:', error);
    throw error;
  }
};

/**
 * פונקציה לעדכון פריט ברשימה
 * @param {string} listId - מזהה הרשימה
 * @param {Object} updatedItem - פריט מעודכן
 * @returns {Promise<void>}
 */
export const updateListItem = async (listId, updatedItem) => {
  try {
    // קבלת הרשימה הנוכחית
    const listRef = doc(db, 'lists', listId);
    const listSnap = await getDoc(listRef);
    
    if (listSnap.exists()) {
      const list = listSnap.data();
      const items = list.items || [];
      
      // עדכון הפריט הספציפי
      const updatedItems = items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      
      // עדכון הרשימה עם הפריטים המעודכנים
      await updateDoc(listRef, {
        items: updatedItems,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating list item:', error);
    throw error;
  }
};

/**
 * פונקציה להסרת פריט מרשימה
 * @param {string} listId - מזהה הרשימה
 * @param {string} itemId - מזהה הפריט
 * @returns {Promise<void>}
 */
export const removeItemFromList = async (listId, itemId) => {
  try {
    // קבלת הרשימה הנוכחית
    const listRef = doc(db, 'lists', listId);
    const listSnap = await getDoc(listRef);
    
    if (listSnap.exists()) {
      const list = listSnap.data();
      const items = list.items || [];
      
      // הסרת הפריט הספציפי
      const updatedItems = items.filter(item => item.id !== itemId);
      
      // עדכון הרשימה עם הפריטים המעודכנים
      await updateDoc(listRef, {
        items: updatedItems,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error removing item from list:', error);
    throw error;
  }
};

/**
 * פונקציה למחיקת רשימה
 * @param {string} listId - מזהה הרשימה
 * @param {string} familyId - מזהה המשפחה
 * @returns {Promise<void>}
 */
export const deleteList = async (listId, familyId) => {
  try {
    // מחיקת הרשימה
    const listRef = doc(db, 'lists', listId);
    await deleteDoc(listRef);
    
    // הסרת הרשימה ממערך הרשימות של המשפחה
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, {
      lists: arrayRemove(listId)
    });
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

/**
 * פונקציה לסימון כל הפריטים ברשימה כמושלמים
 * @param {string} listId - מזהה הרשימה
 * @returns {Promise<void>}
 */
export const markAllListItemsAsCompleted = async (listId) => {
  try {
    // קבלת הרשימה הנוכחית
    const listRef = doc(db, 'lists', listId);
    const listSnap = await getDoc(listRef);
    
    if (listSnap.exists()) {
      const list = listSnap.data();
      const items = list.items || [];
      
      // סימון כל הפריטים כמושלמים
      const updatedItems = items.map(item => ({
        ...item,
        completed: true
      }));
      
      // עדכון הרשימה עם הפריטים המעודכנים
      await updateDoc(listRef, {
        items: updatedItems,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error marking all items as completed:', error);
    throw error;
  }
};

/**
 * פונקציה להסרת פריטים שסומנו כמושלמים מרשימה
 * @param {string} listId - מזהה הרשימה
 * @returns {Promise<void>}
 */
export const clearCompletedItems = async (listId) => {
  try {
    // קבלת הרשימה הנוכחית
    const listRef = doc(db, 'lists', listId);
    const listSnap = await getDoc(listRef);
    
    if (listSnap.exists()) {
      const list = listSnap.data();
      const items = list.items || [];
      
      // סינון הפריטים שלא הושלמו
      const updatedItems = items.filter(item => !item.completed);
      
      // עדכון הרשימה עם הפריטים המעודכנים
      await updateDoc(listRef, {
        items: updatedItems,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error clearing completed items:', error);
    throw error;
  }
};

/**
 * פונקציה לשיוך רשימה למשתמש
 * @param {string} listId - מזהה הרשימה
 * @param {string} userId - מזהה המשתמש
 * @returns {Promise<void>}
 */
export const assignListToUser = async (listId, userId) => {
  try {
    const listRef = doc(db, 'lists', listId);
    await updateDoc(listRef, {
      assignedTo: userId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning list to user:', error);
    throw error;
  }
};

/**
 * פונקציה להורדת שיוך רשימה ממשתמש
 * @param {string} listId - מזהה הרשימה
 * @returns {Promise<void>}
 */
export const unassignListFromUser = async (listId) => {
  try {
    const listRef = doc(db, 'lists', listId);
    await updateDoc(listRef, {
      assignedTo: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error unassigning list from user:', error);
    throw error;
  }
}; 