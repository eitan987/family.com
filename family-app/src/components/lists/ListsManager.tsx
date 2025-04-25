'use client';

import React, { useState, useEffect } from 'react';
import { IoMdCart, IoMdBook, IoMdList, IoMdBookmark, IoMdAdd, IoMdTrash, IoMdPerson } from 'react-icons/io';
import CustomList from './CustomList';
import { AnimatePresence, motion } from 'framer-motion';
import { listsData, familyData } from '../../data/mock-data';
import { CustomList as CustomListType } from '../../types';

// ממשק לסוגי רשימות שניתן ליצור
interface ListType {
  id: string;
  title: string;
  type: 'shopping' | 'cleaning' | 'general';
  icon: React.ReactNode;
  assignedTo?: number; // מזהה חבר המשפחה שהרשימה משויכת אליו
}

const ListsManager: React.FC = () => {
  // רשימת סוגי הרשימות המובנים במערכת
  const defaultListTypes: ListType[] = [
    {
      id: 'shopping',
      title: 'רשימת קניות',
      type: 'shopping',
      icon: <IoMdCart size={24} />,
    },
    {
      id: 'cleaning',
      title: 'רשימת ניקיון',
      type: 'cleaning',
      icon: <IoMdBook size={24} />,
    },
    {
      id: 'general',
      title: 'רשימה כללית',
      type: 'general',
      icon: <IoMdList size={24} />,
    },
  ];

  // סטייט לרשימת הרשימות המותאמות אישית
  const [customLists, setCustomLists] = useState<ListType[]>([]);
  
  // סטייט לתצוגת יצירת רשימה חדשה
  const [showNewListForm, setShowNewListForm] = useState(false);
  // סטייט לשם רשימה חדשה
  const [newListTitle, setNewListTitle] = useState('');
  // סטייט לסוג רשימה חדשה
  const [newListType, setNewListType] = useState<'shopping' | 'cleaning' | 'general'>('general');
  // סטייט לחבר משפחה משויך לרשימה חדשה
  const [newListAssignedTo, setNewListAssignedTo] = useState<number | undefined>(undefined);
  
  // טעינת הרשימות המותאמות אישית בעת הטעינה
  useEffect(() => {
    const loadCustomLists = () => {
      // טעינת נתוני מוק
      const lists: ListType[] = listsData.custom.map(list => ({
        id: list.id,
        title: list.title,
        type: list.type as 'shopping' | 'cleaning' | 'general',
        icon: list.type === 'shopping' 
          ? <IoMdCart size={24} /> 
          : list.type === 'cleaning' 
            ? <IoMdBook size={24} /> 
            : <IoMdBookmark size={24} />,
      }));
      
      // בדיקה אם יש רשימות נוספות בלוקל סטורג׳
      if (typeof window !== 'undefined') {
        const savedLists = localStorage.getItem('custom-lists');
        if (savedLists) {
          const parsedLists = JSON.parse(savedLists);
          // מיזוג הרשימות בצורה שנמנעת כפילויות
          const mergedLists = [...lists];
          
          parsedLists.forEach((list: ListType) => {
            if (!mergedLists.some(l => l.id === list.id)) {
              mergedLists.push(list);
            }
          });
          
          return mergedLists;
        }
      }
      
      return lists;
    };
    
    setCustomLists(loadCustomLists());
  }, []);

  // יצירת רשימה חדשה
  const handleCreateNewList = () => {
    if (newListTitle.trim() === '') return;

    const newList: ListType = {
      id: `custom-${Date.now()}`,
      title: newListTitle,
      type: newListType,
      icon: newListType === 'shopping' 
        ? <IoMdCart size={24} /> 
        : newListType === 'cleaning' 
          ? <IoMdBook size={24} /> 
          : <IoMdBookmark size={24} />,
      assignedTo: newListAssignedTo,
    };

    const updatedLists = [...customLists, newList];
    setCustomLists(updatedLists);
    
    // שמירה בזיכרון מקומי
    localStorage.setItem('custom-lists', JSON.stringify(updatedLists));
    
    // איפוס טופס היצירה
    setNewListTitle('');
    setNewListType('general');
    setNewListAssignedTo(undefined);
    setShowNewListForm(false);
  };

  // מחיקת רשימה מותאמת אישית
  const handleDeleteCustomList = (listId: string) => {
    const updatedLists = customLists.filter(list => list.id !== listId);
    setCustomLists(updatedLists);
    
    // עדכון בזיכרון מקומי
    localStorage.setItem('custom-lists', JSON.stringify(updatedLists));
    
    // מחיקת הנתונים של הרשימה עצמה
    localStorage.removeItem(`${listId}-list-items`);
  };
  
  // מחזיר את שם חבר המשפחה לפי מזהה
  const getMemberName = (memberId: number): string => {
    const member = familyData.members.find(m => m.id === memberId);
    return member ? member.firstName : 'משתמש לא ידוע';
  };
  
  // אנימציות למעבר בין מצבי תצוגה
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      variants={containerVariants}
    >
      {/* רשימות מובנות */}
      <h2 className="text-xl font-bold mb-4">רשימות מובנות</h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {defaultListTypes.map(list => (
          <motion.div key={list.id} variants={itemVariants}>
            <CustomList 
              title={list.title}
              type={list.type}
              icon={list.icon}
              id={list.id}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* רשימות מותאמות אישית */}
      <h2 className="text-xl font-bold mb-4">רשימות מותאמות אישית</h2>
      <AnimatePresence>
        {customLists.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {customLists.map(list => (
              <motion.div 
                key={list.id} 
                variants={itemVariants}
                className="relative"
              >
                <button 
                  onClick={() => handleDeleteCustomList(list.id)}
                  className="absolute top-4 left-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                  title="מחק רשימה"
                >
                  <IoMdTrash size={18} />
                </button>
                
                {list.assignedTo && (
                  <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center z-10">
                    <IoMdPerson size={14} className="ml-1" />
                    {getMemberName(list.assignedTo)}
                  </div>
                )}
                
                <CustomList 
                  title={list.title}
                  type={list.type}
                  icon={list.icon}
                  id={list.id}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-8 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-500">עדיין אין רשימות מותאמות אישית. צור רשימה חדשה כדי להתחיל.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* כפתור ליצירת רשימה חדשה */}
      {!showNewListForm ? (
        <motion.button
          onClick={() => setShowNewListForm(true)}
          className="bg-blue-600 text-white p-3 rounded-md w-full hover:bg-blue-700 transition-colors flex items-center justify-center mb-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <IoMdAdd size={20} className="ml-2" />
          יצירת רשימה חדשה
        </motion.button>
      ) : (
        <motion.div 
          className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <h3 className="text-lg font-medium mb-4">יצירת רשימה חדשה</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">כותרת הרשימה</label>
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="לדוגמה: רשימת מתנות ליום הולדת"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">סוג הרשימה</label>
              <select
                value={newListType}
                onChange={(e) => setNewListType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">רשימה כללית</option>
                <option value="shopping">רשימת קניות</option>
                <option value="cleaning">רשימת ניקיון</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">שייך לחבר משפחה (אופציונלי)</label>
              <select
                value={newListAssignedTo || ''}
                onChange={(e) => setNewListAssignedTo(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">לא משויך</option>
                {familyData.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleCreateNewList}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                צור רשימה
              </button>
              <button
                onClick={() => setShowNewListForm(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors mr-3"
              >
                ביטול
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ListsManager; 