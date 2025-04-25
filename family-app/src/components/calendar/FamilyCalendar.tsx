'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { calendarData, familyData } from '@/data/mock-data';
import { CalendarEvent } from '@/types';
import { format, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import AddEventForm from './AddEventForm';
import EventDetails from './EventDetails';

import 'react-calendar/dist/Calendar.css';

export default function FamilyCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    // המרת הנתונים לטיפוס המתאים
    const typedCalendarData = calendarData.map(event => ({
      ...event,
      repeat: event.repeat as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
      category: event.category as 'family' | 'work' | 'school' | 'holiday' | 'other' | undefined
    }));
    setEvents(typedCalendarData);
  }, []);

  useEffect(() => {
    const eventsOnSelectedDate = events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, selectedDate);
    });
    setSelectedDateEvents(eventsOnSelectedDate);
  }, [selectedDate, events]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  const handleAddEvent = (newEvent: CalendarEvent) => {
    const eventWithId = {
      ...newEvent,
      id: events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1,
    };
    setEvents([...events, eventWithId]);
    setShowAddForm(false);
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents(events.filter((event) => event.id !== eventId));
    setSelectedEvent(null);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // פונקציה להכנת תגית תוכן לכל תאריך בלוח השנה
  const tileContent = ({ date }: { date: Date }) => {
    const eventsOnDate = events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });

    return eventsOnDate.length > 0 ? (
      <div className="flex flex-col items-center mt-1">
        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
        {eventsOnDate.length > 1 && (
          <span className="text-xs text-indigo-700 font-medium mt-0.5">
            {eventsOnDate.length}
          </span>
        )}
      </div>
    ) : null;
  };

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d בMMMM yyyy", { locale: he });
  };

  const getMemberName = (id: number): string => {
    const member = familyData.members.find((m) => m.id === id);
    return member ? member.firstName : 'לא ידוע';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white p-4 rounded-lg shadow-md">
          {/* הגדרות ניראות מותאמות ללוח השנה */}
          <style jsx global>{`
            .react-calendar {
              width: 100%;
              border: none;
              font-family: 'Rubik', sans-serif;
              direction: rtl;
            }
            .react-calendar__navigation {
              justify-content: space-between;
              margin-bottom: 1rem;
            }
            .react-calendar__month-view__weekdays__weekday abbr {
              text-decoration: none;
              font-weight: 600;
            }
            .react-calendar__tile {
              padding: 1rem 0.5rem;
              position: relative;
            }
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background-color: #e0e7ff;
              border-radius: 0.25rem;
            }
            .react-calendar__tile--active {
              background-color: #4f46e5 !important;
              color: white;
              border-radius: 0.25rem;
            }
            .react-calendar__tile--now {
              background-color: #f3f4f6;
              border-radius: 0.25rem;
            }
          `}</style>

          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="he-IL"
            tileContent={tileContent}
          />
        </div>

        <div className="mt-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            אירועים ביום {formatDate(selectedDate)}
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary flex items-center"
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
            {showAddForm ? 'ביטול' : 'הוספת אירוע'}
          </button>
        </div>

        {showAddForm && (
          <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">הוספת אירוע חדש</h3>
            <AddEventForm
              onAddEvent={handleAddEvent}
              onCancel={() => setShowAddForm(false)}
              initialDate={selectedDate}
            />
          </div>
        )}

        {selectedDateEvents.length > 0 ? (
          <div className="mt-4 grid gap-4">
            {selectedDateEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedEvent?.id === event.id
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{event.title}</h3>
                  <div className="text-sm text-indigo-600">
                    {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">מיקום: </span>
                  {event.location}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {event.participants.map((participantId) => (
                    <span
                      key={participantId}
                      className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                    >
                      {getMemberName(participantId)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">אין אירועים מתוכננים לתאריך זה</p>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        {selectedEvent ? (
          <EventDetails event={selectedEvent} onDelete={handleDeleteEvent} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg text-center">
              בחר אירוע כדי לצפות בפרטים נוספים
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 