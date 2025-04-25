'use client';

import React, { useState } from 'react';
import { CalendarEvent } from '@/types';
import { familyData } from '@/data/mock-data';
import { format } from 'date-fns';

interface AddEventFormProps {
  onAddEvent: (event: CalendarEvent) => void;
  onCancel: () => void;
  initialDate: Date;
}

export default function AddEventForm({ onAddEvent, onCancel, initialDate }: AddEventFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultStartTime = '09:00';
  const defaultEndTime = '10:00';
  
  const formattedInitialDate = format(initialDate, 'yyyy-MM-dd');

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formattedInitialDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [participants, setParticipants] = useState<number[]>([]);
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('יש להזין כותרת לאירוע');
      return;
    }

    if (!location.trim()) {
      setError('יש להזין מיקום לאירוע');
      return;
    }

    if (!date) {
      setError('יש לבחור תאריך');
      return;
    }

    if (!startTime || !endTime) {
      setError('יש להזין שעת התחלה ושעת סיום');
      return;
    }

    if (participants.length === 0) {
      setError('יש לבחור לפחות משתתף אחד');
      return;
    }

    // יצירת אירוע חדש
    const newEvent: CalendarEvent = {
      id: 0, // יוחלף בהמשך
      title,
      startDate: `${date}T${startTime}:00`,
      endDate: `${date}T${endTime}:00`,
      participants,
      location,
      description,
      repeat,
    };

    onAddEvent(newEvent);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setDate(formattedInitialDate);
    setStartTime(defaultStartTime);
    setEndTime(defaultEndTime);
    setParticipants([]);
    setRepeat('none');
    setError('');
  };

  const handleParticipantChange = (participantId: number) => {
    setParticipants((prevParticipants) => {
      if (prevParticipants.includes(participantId)) {
        return prevParticipants.filter((id) => id !== participantId);
      } else {
        return [...prevParticipants, participantId];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          כותרת האירוע*
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="הזן כותרת לאירוע"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            תאריך*
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            min={today}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            מיקום*
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field"
            placeholder="הזן מיקום"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            שעת התחלה*
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            שעת סיום*
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
          משתתפים*
        </label>
        <div className="grid grid-cols-2 gap-2">
          {familyData.members.map((member) => (
            <div key={member.id} className="flex items-center">
              <input
                type="checkbox"
                id={`participant-${member.id}`}
                checked={participants.includes(member.id)}
                onChange={() => handleParticipantChange(member.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`participant-${member.id}`}
                className="mr-2 block text-sm text-gray-700"
              >
                {member.firstName}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="repeat" className="block text-sm font-medium text-gray-700 mb-1">
          חזרה
        </label>
        <select
          id="repeat"
          value={repeat}
          onChange={(e) =>
            setRepeat(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly')
          }
          className="input-field"
        >
          <option value="none">ללא חזרה</option>
          <option value="daily">יומי</option>
          <option value="weekly">שבועי</option>
          <option value="monthly">חודשי</option>
          <option value="yearly">שנתי</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          תיאור האירוע
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="הזן תיאור מפורט של האירוע (לא חובה)"
        />
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
          הוספת אירוע
        </button>
      </div>
    </form>
  );
} 