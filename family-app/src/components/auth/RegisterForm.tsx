'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IoMail, IoEye, IoEyeOff, IoPerson, IoLockClosed } from 'react-icons/io5';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return false;
    }
    
    if (formData.password.length < 4) {
      setError('הסיסמה חייבת להכיל לפחות 4 תווים');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // בסביבת פיתוח - תמיד מאפשר הרשמה עם נתונים בסיסיים
      if (process.env.NODE_ENV === 'development') {
        // שימוש בנתוני דמה במצב פיתוח
        const dummyUser = {
          id: 1,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: "הורה"
        };

        console.log('DEV MODE: Registration successful using mock data');
        localStorage.setItem('currentUser', JSON.stringify(dummyUser));
        
        setTimeout(() => {
          router.push('/home');
        }, 1000);
        return;
      }
      
      // במצב אמיתי, כאן היה קוד להרשמה אמיתית דרך ה-API
      
    } catch (err) {
      console.error('Registration error:', err);
      setError('אירעה שגיאה בהרשמה. אנא נסה שוב מאוחר יותר.');
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
      <h1 className="text-2xl font-bold mb-2">הצטרפות למשפחה</h1>
      <p className="text-gray-600 mb-6">יצירת חשבון חדש באפליקציית המשפחה</p>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={inputVariants}>
            <label htmlFor="firstName" className="block text-sm font-medium text-right mb-1">
              שם פרטי
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <IoPerson className="text-gray-400" />
              </div>
              <motion.input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="שם פרטי"
                whileFocus={{ scale: 1.01, borderColor: "#4f46e5" }}
              />
            </div>
          </motion.div>
          
          <motion.div variants={inputVariants}>
            <label htmlFor="lastName" className="block text-sm font-medium text-right mb-1">
              שם משפחה
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <IoPerson className="text-gray-400" />
              </div>
              <motion.input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="שם משפחה"
                whileFocus={{ scale: 1.01, borderColor: "#4f46e5" }}
              />
            </div>
          </motion.div>
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-right mb-1">
            סיסמה
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <IoLockClosed className="text-gray-400" />
            </div>
            <motion.input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="סיסמה (לפחות 4 תווים)"
              dir="ltr"
              whileFocus={{ scale: 1.01, borderColor: "#4f46e5" }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 cursor-pointer" onClick={togglePasswordVisibility}>
              {showPassword ? <IoEyeOff className="text-gray-400" /> : <IoEye className="text-gray-400" />}
            </div>
          </div>
        </motion.div>

        <motion.div variants={inputVariants}>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-right mb-1">
            אימות סיסמה
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <IoLockClosed className="text-gray-400" />
            </div>
            <motion.input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="הקלד שוב את הסיסמה"
              dir="ltr"
              whileFocus={{ scale: 1.01, borderColor: "#4f46e5" }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 cursor-pointer" onClick={toggleConfirmPasswordVisibility}>
              {showConfirmPassword ? <IoEyeOff className="text-gray-400" /> : <IoEye className="text-gray-400" />}
            </div>
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
            {isLoading ? 'יוצר חשבון...' : 'הרשמה'}
          </motion.button>
        </motion.div>

        <motion.div 
          className="text-center text-sm text-gray-600 mt-4"
          variants={inputVariants}
        >
          <div className="mt-2">
            יש לך כבר חשבון?{' '}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              התחבר עכשיו
            </Link>
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
} 