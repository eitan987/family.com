'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdAdd, IoMdTrash, IoMdCheckmarkCircle, IoMdRadioButtonOff, IoMdCreate } from 'react-icons/io';
import { ListItem } from '../../types';
import { listsData } from '../../data/mock-data';

// ממשק עבור הפרופס של הקומפוננטה
interface CustomListProps {
  title: string;
  type: 'shopping' | 'cleaning' | 'general';
  icon?: React.ReactNode;
  id?: string; // מזהה אופציונלי לרשימות מותאמות אישית
}

const CustomList: React.FC<CustomListProps> = ({ title, type, icon, id }) => {
  // סטייט לשמירת פריטי הרשימה
  const [items, setItems] = useState<ListItem[]>([]);
  // סטייט לטקסט של פריט חדש
  const [newItemText, setNewItemText] = useState('');
  // סטייט לקטגוריה של פריט חדש (לרשימות קניות)
  const [newItemCategory, setNewItemCategory] = useState('');
  // סטייט למצב עריכה
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // קטגוריות לרשימת קניות
  const shoppingCategories = ['ירקות ופירות', 'מוצרי חלב', 'בשר ודגים', 'מאפים', 'שימורים', 'מזון יבש', 'חטיפים ומתוקים', 'ניקיון', 'אחר'];
  
  // קטגוריות לרשימת ניקיון
  const cleaningCategories = ['מטבח', 'חדר שינה', 'סלון', 'שירותים ואמבטיה', 'כללי'];

  // טעינת הרשימה מהזיכרון המקומי או מנתוני המוק בעת טעינת הקומפוננטה
  useEffect(() => {
    // טעינת נתונים מה-mock data או מהלוקל סטורג׳
    const loadItems = () => {
      // אם זו רשימה מותאמת אישית עם מזהה
      if (id && id.startsWith('custom')) {
        const customList = listsData.custom.find(list => list.id === id);
        if (customList) {
          return customList.items;
        }
      }
      
      // אם זו אחת מהרשימות המובנות
      if (listsData[type] && !id) {
        return listsData[type];
      }
      
      // בדיקה אם יש נתונים בלוקל סטורג׳
      if (typeof window !== 'undefined') {
        const storedItems = localStorage.getItem(`${id || type}-list-items`);
        if (storedItems) {
          return JSON.parse(storedItems);
        }
      }
      
      // אם אין נתונים, החזר מערך ריק
      return [];
    };
    
    setItems(loadItems());
  }, [type, id]);

  // שמירת הרשימה בזיכרון המקומי בכל פעם שהיא משתנה
  useEffect(() => {
    localStorage.setItem(`${id || type}-list-items`, JSON.stringify(items));
  }, [items, type, id]);

  // הוספת פריט חדש לרשימה
  const handleAddItem = () => {
    if (newItemText.trim() === '') return;

    const newItem: ListItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false,
    };

    // הוספת קטגוריה לפריטי רשימת קניות
    if (type === 'shopping' && newItemCategory) {
      newItem.category = newItemCategory;
    } else if (type === 'cleaning' && newItemCategory) {
      newItem.category = newItemCategory;
    }

    setItems([...items, newItem]);
    setNewItemText('');
    setNewItemCategory('');
  };

  // סימון פריט כ"הושלם"
  const handleToggleComplete = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // מחיקת פריט מהרשימה
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // התחלת עריכת פריט
  const handleStartEdit = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditText(item.text);
  };

  // שמירת העריכה
  const handleSaveEdit = () => {
    if (editingItemId && editText.trim() !== '') {
      setItems(
        items.map((item) =>
          item.id === editingItemId ? { ...item, text: editText } : item
        )
      );
      setEditingItemId(null);
      setEditText('');
    }
  };

  // מחיקת כל הפריטים המסומנים כ"הושלמו"
  const handleClearCompleted = () => {
    setItems(items.filter((item) => !item.completed));
  };

  // זיהוי קטגוריות
  const getCategories = () => {
    if (type === 'shopping') return shoppingCategories;
    if (type === 'cleaning') return cleaningCategories;
    return [];
  };

  // בחירת צבע עבור ראש הרשימה בהתאם לסוג
  const getHeaderColor = () => {
    switch (type) {
      case 'shopping':
        return 'bg-blue-600';
      case 'cleaning':
        return 'bg-green-600';
      default:
        return 'bg-purple-600';
    }
  };

  // מיון פריטים לפי קטגוריה (עבור רשימות קניות)
  const getItemsByCategory = () => {
    if (type !== 'shopping' && type !== 'cleaning') return items;

    const categories = getCategories();
    const result: { [key: string]: ListItem[] } = {};
    
    // יצירת אובייקט עם כל הקטגוריות
    categories.forEach(cat => {
      result[cat] = [];
    });
    
    // הוספת פריטים לקטגוריות שלהם
    items.forEach(item => {
      const category = item.category || 'אחר';
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(item);
    });
    
    return result;
  };

  // האם צריך להציג קטגוריות?
  const shouldShowCategories = type === 'shopping' || type === 'cleaning';
  
  // הפריטים המסווגים
  const categorizedItems = shouldShowCategories ? getItemsByCategory() : null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 dir-rtl">
      <div className={`px-6 py-4 ${getHeaderColor()} text-white flex justify-between items-center`}>
        <h2 className="text-xl font-bold flex items-center">
          {icon && <span className="ml-2">{icon}</span>}
          {title}
        </h2>
        {items.some(item => item.completed) && (
          <button 
            onClick={handleClearCompleted}
            className="text-white bg-opacity-30 bg-black px-3 py-1 rounded text-sm hover:bg-opacity-50 transition-all"
          >
            נקה מושלמים
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex mb-4">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="הוסף פריט חדש..."
            className="flex-grow p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
          
          {type === 'shopping' && (
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">בחר קטגוריה</option>
              {shoppingCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
          
          {type === 'cleaning' && (
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">בחר אזור</option>
              {cleaningCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
          
          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white p-2 rounded-l-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <IoMdAdd size={24} />
          </button>
        </div>

        {shouldShowCategories && categorizedItems ? (
          // תצוגה עם קטגוריות
          Object.entries(categorizedItems).map(([category, categoryItems]) => (
            categoryItems.length > 0 && (
              <div key={category} className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2 pb-1 border-b">{category}</h3>
                <AnimatePresence>
                  {categoryItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-center p-2 border-b ${
                        item.completed ? 'bg-gray-50' : ''
                      }`}
                    >
                      {editingItemId === item.id ? (
                        // מצב עריכה
                        <div className="flex items-center flex-grow">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-grow p-1 border border-gray-300 rounded"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                            onBlur={handleSaveEdit}
                          />
                        </div>
                      ) : (
                        // מצב רגיל
                        <>
                          <button
                            onClick={() => handleToggleComplete(item.id)}
                            className="flex-shrink-0 ml-2"
                          >
                            {item.completed ? (
                              <IoMdCheckmarkCircle
                                className="text-green-500"
                                size={22}
                              />
                            ) : (
                              <IoMdRadioButtonOff
                                className="text-gray-400"
                                size={22}
                              />
                            )}
                          </button>
                          <span
                            className={`flex-grow ${
                              item.completed
                                ? 'line-through text-gray-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {item.text}
                          </span>
                          <div className="flex">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="text-blue-500 ml-2 hover:text-blue-700"
                            >
                              <IoMdCreate size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <IoMdTrash size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          ))
        ) : (
          // תצוגה ללא קטגוריות
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-center p-2 border-b ${
                  item.completed ? 'bg-gray-50' : ''
                }`}
              >
                {editingItemId === item.id ? (
                  // מצב עריכה
                  <div className="flex items-center flex-grow">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-grow p-1 border border-gray-300 rounded"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      onBlur={handleSaveEdit}
                    />
                  </div>
                ) : (
                  // מצב רגיל
                  <>
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className="flex-shrink-0 ml-2"
                    >
                      {item.completed ? (
                        <IoMdCheckmarkCircle
                          className="text-green-500"
                          size={22}
                        />
                      ) : (
                        <IoMdRadioButtonOff
                          className="text-gray-400"
                          size={22}
                        />
                      )}
                    </button>
                    <span
                      className={`flex-grow ${
                        item.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </span>
                    <div className="flex">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-blue-500 ml-2 hover:text-blue-700"
                      >
                        <IoMdCreate size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IoMdTrash size={18} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {items.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            הרשימה ריקה. הוסף פריטים להתחיל.
          </div>
        )}
        
        <div className="text-left mt-4 text-sm text-gray-500">
          סה"כ: {items.length} פריטים | {items.filter(item => item.completed).length} הושלמו
        </div>
      </div>
    </div>
  );
};

export default CustomList; 