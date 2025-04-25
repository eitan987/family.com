'use client';

import React, { useState } from 'react';
import { FamilyMember } from '@/types';

interface EditMemberFormProps {
  member: FamilyMember;
  onUpdate: (updatedMember: FamilyMember) => void;
  onCancel: () => void;
}

export default function EditMemberForm({
  member,
  onUpdate,
  onCancel,
}: EditMemberFormProps) {
  const [formData, setFormData] = useState<FamilyMember>({ ...member });
  const [hobbies, setHobbies] = useState(member.hobbies.join(', '));
  const [error, setError] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleHobbiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHobbies(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      setError('יש להזין שם פרטי');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('יש להזין שם משפחה');
      return;
    }

    if (!formData.birthDate) {
      setError('יש להזין תאריך לידה');
      return;
    }

    // עדכון התחביבים
    const updatedMember = {
      ...formData,
      hobbies: hobbies
        .split(',')
        .map((hobby) => hobby.trim())
        .filter((hobby) => hobby.length > 0),
    };

    onUpdate(updatedMember);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          עריכת פרטים: {member.firstName} {member.lastName}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              שם פרטי*
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              שם משפחה*
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              תאריך לידה*
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              תפקיד*
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="הורה">הורה</option>
              <option value="ילד">ילד</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              טלפון
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className="input-field"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="input-field"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700 mb-1">
            תחביבים (הפרדה בפסיקים)
          </label>
          <input
            type="text"
            id="hobbies"
            name="hobbies"
            value={hobbies}
            onChange={handleHobbiesChange}
            className="input-field"
            placeholder="כדורגל, קריאה, בישול"
          />
        </div>

        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            שמירת שינויים
          </button>
        </div>
      </form>
    </div>
  );
} 