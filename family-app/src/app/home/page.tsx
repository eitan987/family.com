import React from 'react';
import Navbar from '../../components/layout/Navbar';
import DashboardSummary from '../../components/layout/DashboardSummary';
import ClientAuthCheck from '../../components/auth/ClientAuthCheck';

export default function HomePage() {
  // בקוד אמיתי - כאן נבדוק את הסשן אם המשתמש מחובר
  // בדף אמיתי נשתמש ב-middleware או בדיקות שרת, אבל בדוגמה זו אנחנו עובדים רק בצד לקוח
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAuthCheck />
      <Navbar />
      <main className="container py-8">
        <DashboardSummary />
      </main>
    </div>
  );
} 