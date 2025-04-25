import React from 'react';
import Navbar from '../../components/layout/Navbar';
import DocumentsManager from '../../components/documents/DocumentsManager';
import ClientAuthCheck from '../../components/auth/ClientAuthCheck';

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAuthCheck />
      <Navbar />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">מסמכים אישיים</h1>
          <p className="text-gray-600 mt-2">
            ניהול מסמכים ותמונות של בני המשפחה
          </p>
        </div>
        
        <DocumentsManager />
      </main>
    </div>
  );
} 