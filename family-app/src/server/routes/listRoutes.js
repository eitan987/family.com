// נתיבי API לרשימות

import express from 'express';
import { protect } from '../middleware/auth.js';

// הגדר כאן את הבקרים (controllers)
// במצב אמיתי אלו יהיו מיובאים מקובץ נפרד
const getLists = async (req, res) => {
  try {
    const familyId = req.user.familyId;
    
    // תשלוף רשימות מהמסד נתונים (הדוגמה משתמשת בדמה)
    // במצב אמיתי נשתמש במסד נתונים ובשירות שיצרנו
    const lists = {
      message: "רשימות נטענו בהצלחה",
      data: [
        {
          id: "list1",
          title: "רשימת קניות",
          type: "shopping",
          familyId: familyId,
          items: [
            { id: "item1", text: "חלב", completed: false, category: "מוצרי חלב" },
            { id: "item2", text: "לחם", completed: true, category: "מאפים" }
          ]
        },
        {
          id: "list2",
          title: "ניקיון לשבת",
          type: "cleaning",
          familyId: familyId,
          items: [
            { id: "item1", text: "לשטוף רצפה", completed: false, category: "כללי" },
            { id: "item2", text: "לנקות אבק", completed: true, category: "סלון" }
          ]
        }
      ]
    };
    
    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה בטעינת הרשימות",
      message: error.message
    });
  }
};

const getList = async (req, res) => {
  try {
    const listId = req.params.id;
    
    // במצב אמיתי - קבלת רשימה מהמסד נתונים
    const list = {
      id: listId,
      title: "רשימת קניות",
      type: "shopping",
      familyId: req.user.familyId,
      items: [
        { id: "item1", text: "חלב", completed: false, category: "מוצרי חלב" },
        { id: "item2", text: "לחם", completed: true, category: "מאפים" }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה בטעינת הרשימה",
      message: error.message
    });
  }
};

const createList = async (req, res) => {
  try {
    const { title, type, items } = req.body;
    
    // בדיקת תקינות הנתונים
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: "חסרים שדות חובה"
      });
    }
    
    // במצב אמיתי - יצירת רשימה במסד נתונים
    const newList = {
      id: `list-${Date.now()}`,
      title,
      type,
      familyId: req.user.familyId,
      items: items || [],
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newList,
      message: "הרשימה נוצרה בהצלחה"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה ביצירת הרשימה",
      message: error.message
    });
  }
};

const updateList = async (req, res) => {
  try {
    const listId = req.params.id;
    const updates = req.body;
    
    // במצב אמיתי - עדכון הרשימה במסד נתונים
    const updatedList = {
      id: listId,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: updatedList,
      message: "הרשימה עודכנה בהצלחה"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה בעדכון הרשימה",
      message: error.message
    });
  }
};

const deleteList = async (req, res) => {
  try {
    const listId = req.params.id;
    
    // במצב אמיתי - מחיקת הרשימה מהמסד נתונים
    
    res.status(200).json({
      success: true,
      message: "הרשימה נמחקה בהצלחה"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה במחיקת הרשימה",
      message: error.message
    });
  }
};

const updateListItem = async (req, res) => {
  try {
    const listId = req.params.id;
    const itemId = req.params.itemId;
    const updates = req.body;
    
    // במצב אמיתי - עדכון הפריט במסד נתונים
    
    res.status(200).json({
      success: true,
      message: "הפריט עודכן בהצלחה"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה בעדכון הפריט",
      message: error.message
    });
  }
};

const addListItem = async (req, res) => {
  try {
    const listId = req.params.id;
    const { text, category } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: "טקסט הפריט הינו שדה חובה"
      });
    }
    
    // במצב אמיתי - הוספת הפריט לרשימה במסד נתונים
    const newItem = {
      id: `item-${Date.now()}`,
      text,
      category,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: "הפריט נוסף בהצלחה"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה בהוספת הפריט",
      message: error.message
    });
  }
};

const deleteListItem = async (req, res) => {
  try {
    const listId = req.params.id;
    const itemId = req.params.itemId;
    
    // במצב אמיתי - מחיקת הפריט מהרשימה במסד נתונים
    
    res.status(200).json({
      success: true,
      message: "הפריט נמחק בהצלחה"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "שגיאה במחיקת הפריט",
      message: error.message
    });
  }
};

const router = express.Router();

// הגנה על כל הנתיבים
router.use(protect);

// נתיבים בסיסיים לרשימות
router
  .route('/')
  .get(getLists)
  .post(createList);

router
  .route('/:id')
  .get(getList)
  .put(updateList)
  .delete(deleteList);

// נתיבים לפריטים ברשימות
router.route('/:id/items')
  .post(addListItem);

router.route('/:id/items/:itemId')
  .put(updateListItem)
  .delete(deleteListItem);

export default router; 