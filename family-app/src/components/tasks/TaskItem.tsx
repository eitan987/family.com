'use client';

import React from 'react';
import { Task } from '../../types';
import { familyData } from '../../data/mock-data';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: number, newStatus: 'pending' | 'completed') => void;
  onDeleteTask: (taskId: number) => void;
}

export default function TaskItem({ task, onStatusChange, onDeleteTask }: TaskItemProps) {
  const getMemberName = (id: number): string => {
    const member = familyData.members.find((m) => m.id === id);
    return member ? member.firstName : 'לא ידוע';
  };

  const formatDueDate = (dateString: string): string => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .split('T')[0];

    if (dateString === today) {
      return 'היום';
    } else if (dateString === tomorrow) {
      return 'מחר';
    }

    const date = new Date(dateString);
    return format(date, "EEEE, d בMMMM", { locale: he });
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'גבוהה';
      case 'medium':
        return 'בינונית';
      case 'low':
        return 'נמוכה';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <motion.div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
        transition: { duration: 0.2 }
      }}
      layout
    >
      <div className="flex justify-between flex-wrap gap-2">
        <motion.h3 
          className="text-lg font-medium text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {task.title}
        </motion.h3>
        <div className="flex gap-2">
          <motion.span
            className={`text-xs px-2 py-1 rounded-full ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {task.status === 'completed' ? 'הושלם' : 'ממתין'}
          </motion.span>
          <motion.span 
            className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {getPriorityText(task.priority)}
          </motion.span>
        </div>
      </div>

      <motion.div 
        className="mt-2 text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p>
          <span className="font-medium">מיועד ל: </span>
          {getMemberName(task.assignedTo)}
        </p>
        <p className="mt-1">
          <span className="font-medium">תאריך יעד: </span>
          {formatDueDate(task.dueDate)}
        </p>
        {task.description && (
          <motion.p 
            className="mt-2 text-gray-500 whitespace-pre-line"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3 }}
          >
            {task.description}
          </motion.p>
        )}
      </motion.div>

      <motion.div 
        className="mt-4 flex justify-end gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={() =>
            onStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')
          }
          className="px-3 py-1 text-sm font-medium rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {task.status === 'completed' ? 'סמן כממתין' : 'סמן כהושלם'}
        </motion.button>
        <motion.button
          onClick={() => onDeleteTask(task.id)}
          className="px-3 py-1 text-sm font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          מחק
        </motion.button>
      </motion.div>
    </motion.div>
  );
} 