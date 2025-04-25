'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { tasksData, calendarData, familyData } from '@/data/mock-data';
import { Task, CalendarEvent, FamilyMember } from '@/types';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function DashboardSummary() {
  const [user, setUser] = useState<FamilyMember | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // סינון משימות להיום
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = tasksData.filter(
        task => task.dueDate === today || task.dueDate === '2025-04-24'
      );
      
      const typedTodayTasks = todayTasks.map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status as 'pending' | 'completed'
      }));
      
      setTodayTasks(typedTodayTasks);

      // סינון אירועים קרובים
      const upcomingEvents = calendarData.filter(event => {
        const eventDate = new Date(event.startDate);
        const currentDate = new Date();
        const diffTime = Math.abs(eventDate.getTime() - currentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      });
      
      const typedUpcomingEvents = upcomingEvents.map(event => ({
        ...event,
        repeat: event.repeat as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
        category: event.category as 'family' | 'work' | 'school' | 'holiday' | 'other' | undefined
      }));
      
      setUpcomingEvents(typedUpcomingEvents);
    }
  }, []);

  const getMemberName = (id: number): string => {
    const member = familyData.members.find((m) => m.id === id);
    return member ? member.firstName : 'לא ידוע';
  };

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "EEEE, d בMMMM 'בשעה' HH:mm", { locale: he });
  };

  const formatTaskDueDate = (dateString: string): string => {
    if (dateString === new Date().toISOString().split('T')[0]) {
      return 'היום';
    }
    const date = new Date(dateString);
    return format(date, "EEEE, d בMMMM", { locale: he });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {user ? `שלום, ${user.firstName}` : 'ברוכים הבאים למשפחת ' + familyData.lastName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* משימות להיום */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title">משימות להיום</h2>
            <Link href="/tasks" className="text-indigo-600 text-sm hover:underline">
              כל המשימות
            </Link>
          </div>

          {todayTasks.length > 0 ? (
            <ul className="space-y-3">
              {todayTasks.map((task) => (
                <li key={task.id} className="p-3 bg-white border rounded-lg shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {task.status === 'completed' ? 'הושלם' : 'ממתין'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">מיועד ל: </span>
                    {getMemberName(task.assignedTo)}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">אין משימות מתוכננות להיום</p>
          )}
        </div>

        {/* אירועים קרובים */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title">אירועים קרובים</h2>
            <Link href="/calendar" className="text-indigo-600 text-sm hover:underline">
              היומן המלא
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="p-3 bg-white border rounded-lg shadow-sm">
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-indigo-600 mt-1">
                    {formatEventDate(event.startDate)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">מיקום: </span>
                    {event.location}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {event.participants.map((participantId) => (
                      <span
                        key={participantId}
                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                      >
                        {getMemberName(participantId)}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">אין אירועים מתוכננים לשבוע הקרוב</p>
          )}
        </div>
      </div>
    </div>
  );
} 