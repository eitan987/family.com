'use client';

import React from 'react';
import { FamilyMember } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { he } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface MemberDetailsProps {
  member: FamilyMember;
  onEdit: () => void;
}

export default function MemberDetails({ member, onEdit }: MemberDetailsProps) {
  const getAge = (birthDate: string): number => {
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const formatBirthDate = (birthDate: string): string => {
    const date = new Date(birthDate);
    return format(date, "d בMMMM yyyy", { locale: he });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        when: "beforeChildren" 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const iconVariants = {
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.9 }
  };

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-start mb-6">
        <motion.div 
          className="flex items-center"
          variants={itemVariants}
        >
          <motion.div 
            className="h-16 w-16 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-2xl font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            {member.firstName.charAt(0)}
          </motion.div>
          <div className="mr-4">
            <motion.h2 
              className="text-2xl font-bold text-gray-800"
              variants={itemVariants}
            >
              {member.firstName} {member.lastName}
            </motion.h2>
            <motion.p 
              className="text-indigo-600"
              variants={itemVariants}
            >
              {member.role}
            </motion.p>
          </div>
        </motion.div>
        <motion.button
          onClick={onEdit}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors flex items-center"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          עריכה
        </motion.button>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-medium text-gray-500">גיל</h3>
            <p className="mt-1">
              {getAge(member.birthDate)} ({formatBirthDate(member.birthDate)})
            </p>
          </motion.div>

          {member.phone && (
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-medium text-gray-500">טלפון</h3>
              <p className="mt-1 dir-ltr text-right">{member.phone}</p>
            </motion.div>
          )}

          {member.email && (
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-medium text-gray-500">אימייל</h3>
              <p className="mt-1 dir-ltr text-right">{member.email}</p>
            </motion.div>
          )}
        </div>

        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">תחביבים</h3>
          <div className="flex flex-wrap gap-2">
            {member.hobbies.map((hobby, index) => (
              <motion.span
                key={index}
                className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, type: "spring" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {hobby}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 