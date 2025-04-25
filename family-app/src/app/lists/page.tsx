import React from 'react';
import Navbar from '../../components/layout/Navbar';
import ClientAuthCheck from '../../components/auth/ClientAuthCheck';
import ListsManager from '../../components/lists/ListsManager';

export default function ListsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAuthCheck />
      <Navbar />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">רשימות</h1>
          <p className="text-gray-600 mt-2">
            ניהול רשימות קניות, ניקיון ואחרות עבור המשפחה
          </p>
        </div>
        
        <ListsManager />
      </main>
    </div>
  );
} 