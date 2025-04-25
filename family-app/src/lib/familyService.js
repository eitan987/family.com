import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { auth } from './firebaseConfig';
import { getUserData } from './authService';

/**
 * שירות לניהול משפחות ובתי אב במערכת
 */

/**
 * יצירת משפחה חדשה
 * 
 * @param {string} creatorId - מזהה היוצר
 * @param {Object} familyData - פרטי המשפחה
 * @returns {Promise<Object>} - מזהה המשפחה שנוצרה
 */
export const createFamily = async (creatorId, familyData) => {
  try {
    const userData = await getUserData(creatorId);
    if (!userData) throw new Error('משתמש לא קיים');

    // יצירת מסמך משפחה חדש
    const familiesRef = collection(db, 'families');
    const newFamilyRef = doc(familiesRef);
    
    const familyId = newFamilyRef.id;
    
    const newFamily = {
      id: familyId,
      name: familyData.name,
      creator: {
        id: creatorId,
        name: userData.displayName
      },
      members: [{
        id: creatorId,
        name: userData.displayName,
        email: userData.email,
        role: 'admin',
        joinedAt: serverTimestamp()
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...familyData
    };
    
    await setDoc(newFamilyRef, newFamily);
    
    // עדכון המשתמש עם המשפחה שנוצרה
    const userRef = doc(db, 'users', creatorId);
    await updateDoc(userRef, {
      families: arrayUnion({
        id: familyId,
        name: familyData.name,
        role: 'admin'
      })
    });
    
    return { id: familyId, ...newFamily };
  } catch (error) {
    console.error('שגיאה ביצירת משפחה:', error);
    throw error;
  }
};

/**
 * קבלת פרטי משפחה לפי מזהה
 * 
 * @param {string} familyId - מזהה המשפחה
 * @returns {Promise<Object|null>} - אובייקט נתוני המשפחה
 */
export const getFamilyById = async (familyId) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyRef);
    
    if (familyDoc.exists()) {
      return { id: familyDoc.id, ...familyDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('שגיאה בקבלת פרטי משפחה:', error);
    throw error;
  }
};

/**
 * קבלת כל המשפחות של משתמש
 * 
 * @param {string} userId - מזהה המשתמש
 * @returns {Promise<Array>} - מערך של משפחות
 */
export const getUserFamilies = async (userId) => {
  try {
    const userData = await getUserData(userId);
    
    if (!userData || !userData.families || userData.families.length === 0) {
      return [];
    }
    
    // לקבל את כל פרטי המשפחות
    const familiesData = await Promise.all(
      userData.families.map(async (familyRef) => {
        const family = await getFamilyById(familyRef.id);
        return family;
      })
    );
    
    return familiesData.filter(family => family !== null);
  } catch (error) {
    console.error('שגיאה בקבלת משפחות המשתמש:', error);
    throw error;
  }
};

/**
 * עדכון פרטי משפחה
 * 
 * @param {string} familyId - מזהה המשפחה
 * @param {Object} updateData - הנתונים לעדכון
 * @returns {Promise<void>}
 */
export const updateFamily = async (familyId, updateData) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      throw new Error('המשפחה לא קיימת');
    }
    
    await updateDoc(familyRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    // אם השם עודכן, נעדכן גם את הרשומות אצל המשתמשים
    if (updateData.name) {
      const familyData = familyDoc.data();
      const members = familyData.members || [];
      
      await Promise.all(members.map(async (member) => {
        const userRef = doc(db, 'users', member.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const families = userData.families || [];
          
          const updatedFamilies = families.map(family => {
            if (family.id === familyId) {
              return { ...family, name: updateData.name };
            }
            return family;
          });
          
          await updateDoc(userRef, { families: updatedFamilies });
        }
      }));
    }
  } catch (error) {
    console.error('שגיאה בעדכון פרטי משפחה:', error);
    throw error;
  }
};

/**
 * הזמנת משתמש למשפחה
 * 
 * @param {string} familyId - מזהה המשפחה
 * @param {string} email - כתובת האימייל של המשתמש להזמנה
 * @param {string} role - תפקיד במשפחה (ברירת מחדל: 'member')
 * @returns {Promise<Object>} - אובייקט תוצאת ההזמנה
 */
export const inviteUserToFamily = async (familyId, email, role = 'member') => {
  try {
    // בדיקה אם המשתמש קיים
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // ליצור הזמנה למשתמש שעדיין לא קיים במערכת
      const invitationsRef = collection(db, 'invitations');
      const newInvitationRef = doc(invitationsRef);
      
      await setDoc(newInvitationRef, {
        familyId,
        email,
        role,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      return { status: 'invitation_created', invitationId: newInvitationRef.id };
    }
    
    // המשתמש קיים - הוספת המשפחה למשתמש והמשתמש למשפחה
    const user = querySnapshot.docs[0];
    const userId = user.id;
    const userData = user.data();
    
    const familyRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      throw new Error('המשפחה לא קיימת');
    }
    
    const familyData = familyDoc.data();
    
    // בדיקה אם המשתמש כבר קיים במשפחה
    const isMember = familyData.members.some(member => member.id === userId);
    
    if (isMember) {
      return { status: 'already_member' };
    }
    
    // הוספת המשתמש למשפחה
    await updateDoc(familyRef, {
      members: arrayUnion({
        id: userId,
        name: userData.displayName,
        email: userData.email,
        role,
        joinedAt: serverTimestamp()
      }),
      updatedAt: serverTimestamp()
    });
    
    // הוספת המשפחה למשתמש
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      families: arrayUnion({
        id: familyId,
        name: familyData.name,
        role
      })
    });
    
    return { status: 'member_added', userId };
  } catch (error) {
    console.error('שגיאה בהזמנת משתמש למשפחה:', error);
    throw error;
  }
};

/**
 * הסרת משתמש ממשפחה
 * 
 * @param {string} familyId - מזהה המשפחה
 * @param {string} userId - מזהה המשתמש להסרה
 * @returns {Promise<void>}
 */
export const removeUserFromFamily = async (familyId, userId) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      throw new Error('המשפחה לא קיימת');
    }
    
    const familyData = familyDoc.data();
    
    // מציאת המשתמש במשפחה
    const memberToRemove = familyData.members.find(member => member.id === userId);
    
    if (!memberToRemove) {
      throw new Error('המשתמש אינו חבר במשפחה');
    }
    
    // בדיקה שהיוצר לא מוסר את עצמו אם הוא המנהל היחיד
    if (familyData.creator.id === userId) {
      const adminCount = familyData.members.filter(member => member.role === 'admin').length;
      
      if (adminCount === 1) {
        throw new Error('לא ניתן להסיר את המנהל היחיד של המשפחה');
      }
    }
    
    // הסרת המשתמש מהמשפחה
    await updateDoc(familyRef, {
      members: arrayRemove(memberToRemove),
      updatedAt: serverTimestamp()
    });
    
    // הסרת המשפחה מהמשתמש
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const familyToRemove = userData.families.find(family => family.id === familyId);
      
      if (familyToRemove) {
        await updateDoc(userRef, {
          families: arrayRemove(familyToRemove)
        });
      }
    }
  } catch (error) {
    console.error('שגיאה בהסרת משתמש ממשפחה:', error);
    throw error;
  }
};

/**
 * שינוי תפקיד משתמש במשפחה
 * 
 * @param {string} familyId - מזהה המשפחה
 * @param {string} userId - מזהה המשתמש
 * @param {string} newRole - התפקיד החדש
 * @returns {Promise<void>}
 */
export const updateMemberRole = async (familyId, userId, newRole) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      throw new Error('המשפחה לא קיימת');
    }
    
    const familyData = familyDoc.data();
    
    // עדכון המשתמש במשפחה
    const updatedMembers = familyData.members.map(member => {
      if (member.id === userId) {
        return { ...member, role: newRole };
      }
      return member;
    });
    
    await updateDoc(familyRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    // עדכון המשפחה אצל המשתמש
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedFamilies = userData.families.map(family => {
        if (family.id === familyId) {
          return { ...family, role: newRole };
        }
        return family;
      });
      
      await updateDoc(userRef, {
        families: updatedFamilies
      });
    }
  } catch (error) {
    console.error('שגיאה בעדכון תפקיד משתמש:', error);
    throw error;
  }
};

/**
 * מחיקת משפחה
 * 
 * @param {string} familyId - מזהה המשפחה למחיקה
 * @returns {Promise<void>}
 */
export const deleteFamily = async (familyId) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      throw new Error('המשפחה לא קיימת');
    }
    
    const familyData = familyDoc.data();
    const members = familyData.members || [];
    
    // הסרת המשפחה מכל המשתמשים
    await Promise.all(members.map(async (member) => {
      const userRef = doc(db, 'users', member.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const familyToRemove = userData.families.find(family => family.id === familyId);
        
        if (familyToRemove) {
          await updateDoc(userRef, {
            families: arrayRemove(familyToRemove)
          });
        }
      }
    }));
    
    // מחיקת המשפחה
    await deleteDoc(familyRef);
  } catch (error) {
    console.error('שגיאה במחיקת משפחה:', error);
    throw error;
  }
};

/**
 * שירות לניהול קבוצות משפחתיות בפיירסטור
 */
export const familyService = {
  /**
   * קבלת הזמנות של משתמש
   * @param {string} userId - מזהה המשתמש
   * @returns {Promise<Object>} - רשימת ההזמנות והשגיאה (אם יש שגיאה)
   */
  getUserInvites: async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("משתמש לא נמצא");
      }
      
      const userData = userSnap.data();
      const invites = userData.invites || [];
      
      return { invites, error: null };
    } catch (error) {
      console.error("Get user invites error:", error);
      return { invites: [], error: error.message };
    }
  },
  
  /**
   * קבלת או דחיית הזמנה למשפחה
   * @param {string} userId - מזהה המשתמש
   * @param {Object} invitation - פרטי ההזמנה
   * @param {boolean} accept - האם לאשר את ההזמנה
   * @returns {Promise<Object>} - האם הפעולה הצליחה והשגיאה (אם יש שגיאה)
   */
  respondToInvite: async (userId, invitation, accept) => {
    try {
      const userRef = doc(db, "users", userId);
      const familyRef = doc(db, "families", invitation.familyId);
      
      // הסרת ההזמנה מהמשתמש
      await updateDoc(userRef, {
        invites: arrayRemove(invitation)
      });
      
      if (accept) {
        // הוספת המשתמש למשפחה
        await updateDoc(familyRef, {
          members: arrayUnion({
            id: userId,
            role: 'member',
            joinedAt: serverTimestamp()
          }),
          updatedAt: serverTimestamp()
        });
        
        // הוספת המשפחה למשתמש
        await updateDoc(userRef, {
          families: arrayUnion(invitation.familyId)
        });
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Respond to invite error:", error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * הסרת חבר ממשפחה
   * @param {string} familyId - מזהה המשפחה
   * @param {string} memberId - מזהה החבר להסרה
   * @param {string} currentUserId - מזהה המשתמש הנוכחי
   * @returns {Promise<Object>} - האם הפעולה הצליחה והשגיאה (אם יש שגיאה)
   */
  removeMember: async (familyId, memberId, currentUserId) => {
    try {
      const familyRef = doc(db, "families", familyId);
      const familySnap = await getDoc(familyRef);
      
      if (!familySnap.exists()) {
        throw new Error("משפחה לא נמצאה");
      }
      
      const familyData = familySnap.data();
      
      // וידוא שהמשתמש הנוכחי הוא מנהל
      const currentUserMember = familyData.members.find(member => member.id === currentUserId);
      if (!currentUserMember || currentUserMember.role !== 'admin') {
        throw new Error("אין לך הרשאה להסיר חברים מהמשפחה");
      }
      
      // איתור החבר להסרה
      const memberToRemove = familyData.members.find(member => member.id === memberId);
      if (!memberToRemove) {
        throw new Error("החבר לא נמצא במשפחה");
      }
      
      // עדכון מסמך המשפחה
      await updateDoc(familyRef, {
        members: familyData.members.filter(member => member.id !== memberId),
        updatedAt: serverTimestamp()
      });
      
      // הסרת המשפחה מהמשתמש
      const userRef = doc(db, "users", memberId);
      await updateDoc(userRef, {
        families: arrayRemove(familyId)
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Remove member error:", error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * שינוי תפקיד של חבר במשפחה
   * @param {string} familyId - מזהה המשפחה
   * @param {string} memberId - מזהה החבר לעדכון
   * @param {string} newRole - תפקיד החבר החדש
   * @param {string} currentUserId - מזהה המשתמש הנוכחי
   * @returns {Promise<Object>} - האם העדכון הצליח והשגיאה (אם יש שגיאה)
   */
  changeMemberRole: async (familyId, memberId, newRole, currentUserId) => {
    try {
      const familyRef = doc(db, "families", familyId);
      const familySnap = await getDoc(familyRef);
      
      if (!familySnap.exists()) {
        throw new Error("משפחה לא נמצאה");
      }
      
      const familyData = familySnap.data();
      
      // וידוא שהמשתמש הנוכחי הוא מנהל
      const currentUserMember = familyData.members.find(member => member.id === currentUserId);
      if (!currentUserMember || currentUserMember.role !== 'admin') {
        throw new Error("אין לך הרשאה לשנות תפקידים במשפחה");
      }
      
      // איתור החבר לעדכון
      const memberIndex = familyData.members.findIndex(member => member.id === memberId);
      if (memberIndex === -1) {
        throw new Error("החבר לא נמצא במשפחה");
      }
      
      // עדכון תפקיד החבר
      const updatedMembers = [...familyData.members];
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        role: newRole
      };
      
      // עדכון מסמך המשפחה
      await updateDoc(familyRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Change member role error:", error);
      return { success: false, error: error.message };
    }
  }
};

export default familyService; 