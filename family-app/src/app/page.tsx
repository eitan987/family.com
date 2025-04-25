import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import DebugInfo from '../components/debug/DebugInfo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="pt-8 pb-5">
          <h2 className="text-center text-3xl font-bold text-gray-800">ברוכים הבאים</h2>
        </div>
        <div className="px-8 py-6">
          <LoginForm />
          <DebugInfo />
        </div>
      </div>
    </div>
  );
} 