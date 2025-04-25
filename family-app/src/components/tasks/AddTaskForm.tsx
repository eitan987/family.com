'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { familyData } from '@/data/mock-data';

interface AddTaskFormProps {
  onAddTask: (task: Task) => void;
  onCancel: () => void;
}

export default function AddTaskForm({ onAddTask, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<number>(0);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('יש להזין כותרת למשימה');
      return;
    }

    if (assignedTo === 0) {
      setError('יש לבחור אדם שהמשימה מיועדת אליו');
      return;
    }

    if (!dueDate) {
      setError('יש להזין תאריך יעד');
      return;
    }

    const newTask: Task = {
      id: 0, // יוחלף בהמשך
      title,
      assignedTo,
      dueDate,
      status: 'pending',
      description,
      priority,
    };

    onAddTask(newTask);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setAssignedTo(0);
    setDueDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPriority('medium');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          כותרת המשימה*
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="הזן כותרת למשימה"
        />
      </div>

      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
          מיועד ל*
        </label>
        <select
          id="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(Number(e.target.value))}
          className="input-field"
        >
          <option value={0} disabled>
            בחר מיועד
          </option>
          {familyData.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          תאריך יעד*
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input-field"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          תיאור המשימה
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="הזן תיאור מפורט של המשימה (לא חובה)"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          עדיפות
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="input-field"
        >
          <option value="low">נמוכה</option>
          <option value="medium">בינונית</option>
          <option value="high">גבוהה</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 space-x-reverse">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          ביטול
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          הוספת משימה
        </button>
      </div>
    </form>
  );
} 