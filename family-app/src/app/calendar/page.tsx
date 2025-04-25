import React from 'react';
import Navbar from '../../components/layout/Navbar';
import FamilyCalendar from '../../components/calendar/FamilyCalendar';
import ClientAuthCheck from '../../components/auth/ClientAuthCheck';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAuthCheck />
      <Navbar />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">יומן משפחתי</h1>
          <p className="text-gray-600 mt-2">
            צפייה, הוספה ועריכה של אירועים משפחתיים
          </p>
        </div>
        
        <FamilyCalendar />
      </main>
    </div>
  );
} 