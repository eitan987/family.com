'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { familyData } from '@/data/mock-data';
import { FamilyMember } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<FamilyMember | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // קריאת המשתמש המחובר מהלוקל סטורג'
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        // במצב פיתוח - פשוט מוחקים את הנתונים מהלוקל סטורג'
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        router.push('/');
        return;
      }
      
      // ביצוע התנתקות באמצעות ה-API
      await authAPI.logout();
      
      // ניווט לדף ההתחברות
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // במקרה של שגיאה, עדיין מוחקים את הנתונים המקומיים
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { href: '/home', label: 'בית' },
    { href: '/tasks', label: 'משימות' },
    { href: '/calendar', label: 'יומן משפחתי' },
    { href: '/personal', label: 'פרטים אישיים' },
    { href: '/documents', label: 'מסמכים' },
  ];

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: { scale: 1.05 }
  };

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.nav 
      className="bg-white shadow-md"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* לוגו ושם המשפחה */}
          <motion.div 
            className="flex items-center"
            variants={linkVariants}
          >
            <div className="flex-shrink-0 flex items-center">
              <motion.span 
                className="text-xl font-bold text-indigo-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                משפחת {familyData.lastName}
              </motion.span>
            </div>
          </motion.div>

          {/* תפריט ניווט - מוצג במסך גדול */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {navLinks.map((link) => (
              <motion.div key={link.href} variants={linkVariants} whileHover="hover">
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* פרופיל משתמש */}
          <div className="flex items-center">
            {user && (
              <div className="flex items-center ml-4 relative">
                <motion.button
                  onClick={toggleMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="ml-2 text-gray-700">{user.firstName}</span>
                  <motion.div 
                    className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700"
                    whileHover={{ scale: 1.1, backgroundColor: "#c7d2fe" }}
                  >
                    {user.firstName.charAt(0)}
                  </motion.div>
                </motion.button>

                {/* תפריט פרופיל */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      className="absolute left-0 top-10 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      variants={menuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <motion.button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        whileHover={{ backgroundColor: "#f3f4f6" }}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? 'מתנתק...' : 'התנתקות'}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* כפתור המבורגר למסך קטן */}
            <div className="md:hidden flex items-center">
              <motion.button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-100 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, rotate: 180 }}
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* תפריט נייד */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="pt-2 pb-3 space-y-1"
                variants={navVariants}
                initial="hidden"
                animate="visible"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.href} variants={linkVariants}>
                    <Link
                      href={link.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        pathname === link.href
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.button
                  onClick={handleLogout}
                  className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  variants={linkVariants}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'מתנתק...' : 'התנתקות'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
} 