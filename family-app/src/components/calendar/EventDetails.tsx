'use client';

import React from 'react';
import { CalendarEvent } from '@/types';
import { familyData } from '@/data/mock-data';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface EventDetailsProps {
  event: CalendarEvent;
  onDelete: (eventId: number) => void;
}

export default function EventDetails({ event, onDelete }: EventDetailsProps) {
  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: he });
  };

  const getMemberName = (id: number): string => {
    const member = familyData.members.find((m) => m.id === id);
    return member ? member.firstName : 'לא ידוע';
  };

  const getRepeatText = (repeat: string): string => {
    switch (repeat) {
      case 'none':
        return 'ללא חזרה';
      case 'daily':
        return 'יומי';
      case 'weekly':
        return 'שבועי';
      case 'monthly':
        return 'חודשי';
      case 'yearly':
        return 'שנתי';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
        <button
          onClick={() => onDelete(event.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="מחק אירוע"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">תאריך</h3>
          <p className="mt-1 text-indigo-600 font-medium">{formatEventDate(event.startDate)}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">שעות</h3>
          <p className="mt-1">
            {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">מיקום</h3>
          <p className="mt-1">{event.location}</p>
        </div>

        {event.repeat !== 'none' && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">חזרה</h3>
            <p className="mt-1">{getRepeatText(event.repeat)}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500">משתתפים</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {event.participants.map((participantId) => (
              <span
                key={participantId}
                className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full"
              >
                {getMemberName(participantId)}
              </span>
            ))}
          </div>
        </div>

        {event.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">תיאור</h3>
            <p className="mt-1 text-gray-600 whitespace-pre-line">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
} 