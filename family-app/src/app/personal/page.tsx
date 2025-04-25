import React from 'react';
import Navbar from '../../components/layout/Navbar';
import PersonalInfo from '../../components/personal/PersonalInfo';
import ClientAuthCheck from '../../components/auth/ClientAuthCheck';

export default function PersonalInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAuthCheck />
      <Navbar />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">פרטים אישיים</h1>
          <p className="text-gray-600 mt-2">
            צפייה ועריכה של פרטי בני המשפחה
          </p>
        </div>
        
        <PersonalInfo />
      </main>
    </div>
  );
} 