'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authAPI } from '../../lib/api';
import { IoMail, IoEye, IoEyeOff } from 'react-icons/io5';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // בדיקה אם המשתמש כבר מחובר
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          console.log('User already logged in, redirecting to home page');
          router.push('/home');
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // בסביבת פיתוח - תמיד מאפשר התחברות עם נתונים בסיסיים
      if (process.env.NODE_ENV === 'development' && formData.password.length > 3) {
        // שימוש בנתוני דמה במצב פיתוח אם השרת אינו זמין
        const dummyUser = {
          id: 1,
          firstName: "דן",
          lastName: "ישראלי",
          email: formData.email,
          role: "הורה"
        };

        console.log('DEV MODE: Login successful using mock data');
        localStorage.setItem('currentUser', JSON.stringify(dummyUser));
        
        setTimeout(() => {
          router.push('/home');
        }, 500);
        return;
      }
      
      // התחברות אמיתית דרך ה-API
      const response = await authAPI.login(formData.email, formData.password);
      
      console.log('Login successful, redirecting to home page');
      
      // אם נרצה לזכור את המשתמש, נשמור את הטוקן (במצב אמיתי)
      if (formData.rememberMe) {
        // הטוקן כבר נשמר ב-API
      }
      
      // קצת השהייה כדי לאפשר לאנימציות להתרחש
      setTimeout(() => {
        // ניווט לעמוד הבית
        router.push('/home');
      }, 500);
      
    } catch (err) {
      console.error('Login error:', err);
      // בדיקה אם חיבור לשרת נכשל
      if (err.message?.includes('Network Error')) {
        setError('לא הצלחנו להתחבר לשרת. נסה שוב מאוחר יותר.');
      } else {
        setError('שם משתמש או סיסמה שגויים');
      }
      setIsLoading(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1,
        when: "beforeChildren" 
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold mb-2">ברוכים הבאים</h1>
      <p className="text-gray-600 mb-6">התחבר לאפליקציית המשפחה</p>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={inputVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-right mb-1">
            כתובת אימייל
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <IoMail className="text-gray-400" />
            </div>
            <motion.input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              dir="ltr"
              whileFocus={{ scale: 1.01, borderColor: "#4f46e5" }}
            />
          </div>
        </motion.div>

        <motion.div variants={inputVariants}>
          <div className="flex justify-between items-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              שכחת סיסמה?
            </Link>
            <label htmlFor="password" className="block text-sm font-medium">
              סיסמה
            </label>
          </div>
          <div className="relative mt-1">
            <motion.input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              dir="ltr"
              whileFocus={{ scale: 1.01, borderColor: "#4f46e5" }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 cursor-pointer" onClick={togglePasswordVisibility}>
              {showPassword ? <IoEyeOff className="text-gray-400" /> : <IoEye className="text-gray-400" />}
            </div>
          </div>
        </motion.div>

        <motion.div className="flex items-center justify-end" variants={inputVariants}>
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
            />
            <label htmlFor="rememberMe" className="block text-sm text-gray-700">
              זכור אותי
            </label>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            className="bg-red-50 text-red-500 p-3 rounded-md text-sm font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
          >
            {error}
          </motion.div>
        )}

        <motion.div variants={buttonVariants}>
          <motion.button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isLoading}
          >
            {isLoading ? 'מעבר...' : 'התחברות'}
          </motion.button>
        </motion.div>

        <motion.div 
          className="text-center text-sm text-gray-600 mt-6"
          variants={inputVariants}
        >
          <p className="px-8">
            וסיסמה כלשהי: dan@family.com למטרות הדגמה
            <br />
            (לפחות 4 תווים)
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            אין לך חשבון עדיין?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              הירשם עכשיו
            </Link>
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
} 