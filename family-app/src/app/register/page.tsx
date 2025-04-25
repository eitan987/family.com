import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';
import DebugInfo from '../../components/debug/DebugInfo';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="pt-8 pb-5">
          <h2 className="text-center text-3xl font-bold text-gray-800">הרשמה</h2>
        </div>
        <div className="px-8 py-6">
          <RegisterForm />
          <DebugInfo />
        </div>
      </div>
    </div>
  );
} 