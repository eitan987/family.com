'use client';

import React, { useState, useEffect } from 'react';
import { familyData } from '@/data/mock-data';
import { FamilyMember } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { he } from 'date-fns/locale';
import MemberDetails from './MemberDetails';
import EditMemberForm from './EditMemberForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function PersonalInfo() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'edit'>('list');

  useEffect(() => {
    setMembers(familyData.members);
  }, []);

  const handleEditClick = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsEditing(true);
    setCurrentView('edit');
  };

  const handleViewClick = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsEditing(false);
    setCurrentView('details');
  };

  const handleUpdateMember = (updatedMember: FamilyMember) => {
    setMembers(
      members.map((member) => (member.id === updatedMember.id ? updatedMember : member))
    );
    setSelectedMember(updatedMember);
    setIsEditing(false);
    setCurrentView('details');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentView('list');
  };

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

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="lg:col-span-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-md"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800">בני המשפחה</h2>
          <div className="divide-y">
            {members.map((member, index) => (
              <motion.div 
                key={member.id} 
                className="py-3"
                variants={itemVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMember?.id === member.id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleViewClick(member)}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {member.firstName.charAt(0)}
                    </motion.div>
                    <div className="mr-3">
                      <h3 className="font-medium">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {currentView === 'list' && (
            <motion.div 
              key="no-selection"
              className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col justify-center items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </motion.svg>
              <motion.p 
                className="text-gray-500 text-lg text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                בחר באחד מבני המשפחה מהרשימה כדי לצפות בפרטים
              </motion.p>
            </motion.div>
          )}
          
          {currentView === 'details' && selectedMember && (
            <motion.div
              key="member-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <MemberDetails
                member={selectedMember}
                onEdit={() => handleEditClick(selectedMember)}
              />
            </motion.div>
          )}
          
          {currentView === 'edit' && selectedMember && (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <EditMemberForm
                member={selectedMember}
                onUpdate={handleUpdateMember}
                onCancel={handleCancelEdit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 