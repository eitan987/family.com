'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ClientAuthCheck() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      
      // קובעים את מצב האימות
      setIsAuthenticated(!!currentUser);
      
      // אם המשתמש לא מאומת ולא נמצא בדף הראשי, ניווט לדף הראשי
      if (!currentUser && window.location.pathname !== '/') {
        console.log('User not authenticated, redirecting to home page');
        router.push('/');
      }
    }
  }, [router]);

  // מציגים רק כאשר יודעים את מצב האימות
  if (isAuthenticated === null) {
    return null; // או לוגיקת טעינה
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );
} 