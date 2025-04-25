'use client';

import React, { useState } from 'react';
import { Document } from '@/types';
import { familyData } from '@/data/mock-data';

interface UploadDocumentFormProps {
  onAddDocument: (document: Document) => void;
  onCancel: () => void;
}

export default function UploadDocumentForm({
  onAddDocument,
  onCancel,
}: UploadDocumentFormProps) {
  const [title, setTitle] = useState('');
  const [memberId, setMemberId] = useState<number>(0);
  const [type, setType] = useState<'pdf' | 'image' | 'doc' | 'other'>('pdf');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('יש להזין כותרת למסמך');
      return;
    }

    if (memberId === 0) {
      setError('יש לבחור אדם שאליו שייך המסמך');
      return;
    }

    if (!selectedFile) {
      setError('יש לבחור קובץ להעלאה');
      return;
    }

    // בסביבת דמה, העלאת הקובץ תהיה "מדומה"
    // במימוש אמיתי היינו מעלים את הקובץ לשרת ומקבלים URL חזרה

    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const mockedPath = '/documents/' + selectedFile.name.replace(/\s+/g, '_');

    const newDocument: Document = {
      id: 0, // יוחלף בהמשך
      title,
      memberId,
      type: type === 'other' ? 'doc' : type as 'pdf' | 'image' | 'doc',
      uploadDate: new Date().toISOString().split('T')[0],
      url: mockedPath,
      uploadedBy: memberId,
      tags: tagsArray,
    };

    onAddDocument(newDocument);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setMemberId(0);
    setType('pdf');
    setTags('');
    setSelectedFile(null);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          כותרת המסמך*
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="תעודת לידה, תעודת זהות, וכו'"
        />
      </div>

      <div>
        <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-1">
          שייך ל*
        </label>
        <select
          id="memberId"
          value={memberId}
          onChange={(e) => setMemberId(Number(e.target.value))}
          className="input-field"
        >
          <option value={0} disabled>
            בחר אדם
          </option>
          {familyData.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          סוג מסמך*
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'pdf' | 'image' | 'doc' | 'other')}
          className="input-field"
        >
          <option value="pdf">PDF</option>
          <option value="image">תמונה</option>
          <option value="doc">מסמך Word</option>
          <option value="other">אחר</option>
        </select>
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
          בחר קובץ*
        </label>
        <input
          type="file"
          id="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {selectedFile && (
          <p className="mt-1 text-sm text-gray-500">נבחר: {selectedFile.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          תגיות (הפרדה בפסיקים)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input-field"
          placeholder="מסמכים רשמיים, בית ספר, וכו'"
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
          העלאה
        </button>
      </div>
    </form>
  );
} 