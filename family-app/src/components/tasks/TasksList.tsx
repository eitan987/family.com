'use client';

import React, { useState, useEffect } from 'react';
import { tasksData, familyData } from '../../data/mock-data';
import { Task } from '../../types';
import AddTaskForm from './AddTaskForm';
import TaskItem from './TaskItem';
import { motion, AnimatePresence } from 'framer-motion';

export default function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterBy, setFilterBy] = useState<number | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    // המרת הנתונים לטיפוס המתאים
    const typedTasksData = tasksData.map(task => ({
      ...task,
      priority: task.priority as 'low' | 'medium' | 'high',
      status: task.status as 'pending' | 'completed'
    }));
    setTasks(typedTasksData);
  }, []);

  const handleTaskStatusChange = (taskId: number, newStatus: 'pending' | 'completed') => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );
  };

  const handleAddTask = (newTask: Task) => {
    // בסביבה אמיתית היינו שולחים את המשימה לשרת
    // כאן נוסיף אותה למערך הלוקאלי
    const taskWithId = {
      ...newTask,
      id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
    };
    setTasks([...tasks, taskWithId]);
    setShowAddForm(false);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPerson = filterBy === 'all' || task.assignedTo === filterBy;
    return matchesStatus && matchesPerson;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        when: "beforeChildren",
        duration: 0.3
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex flex-col md:flex-row md:justify-between mb-6 space-y-4 md:space-y-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex space-x-4 space-x-reverse">
          <motion.button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary flex items-center"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {showAddForm ? 'ביטול' : 'הוספת משימה'}
          </motion.button>
        </div>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 md:space-x-reverse">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              סטטוס
            </label>
            <motion.select
              id="statusFilter"
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option value="all">הכל</option>
              <option value="pending">ממתין</option>
              <option value="completed">הושלם</option>
            </motion.select>
          </div>

          <div>
            <label htmlFor="personFilter" className="block text-sm font-medium text-gray-700 mb-1">
              שייך ל
            </label>
            <motion.select
              id="personFilter"
              className="input-field"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option value="all">כל המשפחה</option>
              {familyData.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName}
                </option>
              ))}
            </motion.select>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-md mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2 className="text-xl font-bold mb-4">הוספת משימה חדשה</h2>
            <AddTaskForm onAddTask={handleAddTask} onCancel={() => setShowAddForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {filteredTasks.length > 0 ? (
          <motion.div 
            className="grid gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            layout
          >
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <TaskItem
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                    onDeleteTask={handleDeleteTask}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white p-8 rounded-lg shadow text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.p 
              className="text-gray-500 text-lg"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              אין משימות התואמות את הסינון שבחרת
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 