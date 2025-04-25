import React, { useState } from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskComplete, onTaskDelete }) => {
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const taskVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    exit: { 
      opacity: 0, 
      x: -20, 
      transition: { duration: 0.2 } 
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          משימות משפחתיות
        </motion.h2>
        <div className="flex space-x-2">
          {['all', 'todo', 'in-progress', 'completed'].map((filterType) => (
            <motion.button 
              key={filterType}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setFilter(filterType as any)}
              className={`px-3 py-1 rounded-md ${filter === filterType ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {filterType === 'all' ? 'הכל' : 
               filterType === 'todo' ? 'לביצוע' : 
               filterType === 'in-progress' ? 'בתהליך' : 'הושלם'}
            </motion.button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <motion.div 
          className="text-center py-10 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          אין משימות להצגה
        </motion.div>
      ) : (
        <motion.ul 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {filteredTasks.map((task) => (
              <motion.li
                key={task.id}
                variants={taskVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover="hover"
                layout
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <motion.input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => onTaskComplete(task.id.toString())}
                    className="h-5 w-5 text-blue-600 rounded"
                    whileTap={{ scale: 1.2 }}
                  />
                  <div className="ms-3">
                    <h3 className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <motion.span 
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {task.priority === 'high' ? 'גבוה' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </motion.span>
                      <span className="text-sm text-gray-500">תאריך יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => onTaskDelete(task.id.toString())}
                  className="text-red-500 hover:text-red-700"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </motion.div>
  );
};

export default TaskList; 