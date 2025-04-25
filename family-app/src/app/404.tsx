'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dir-rtl">
      <motion.div 
        className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="text-6xl text-indigo-500 font-bold mb-4"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.2 }}
        >
          404
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          הדף לא נמצא
        </motion.h2>
        
        <motion.p 
          className="text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          נראה שהדף שחיפשת אינו קיים. ייתכן שהכתובת שהקלדת שגויה או שהדף הוזז למיקום אחר.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            href="/"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            חזרה לדף הבית
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
} 