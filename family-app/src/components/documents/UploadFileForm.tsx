'use client';

import React, { useState, useRef } from 'react';
import { Document } from '@/types';
import { familyData } from '@/data/mock-data';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadFileFormProps {
  onUploadComplete: (document: Document) => void;
  onCancel: () => void;
}

export default function UploadFileForm({ onUploadComplete, onCancel }: UploadFileFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'אחר',
    isPublic: true,
    associatedMemberId: 0
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // הטיפוסים הנתמכים
  const supportedFileTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    'spreadsheet': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'presentation': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'isPublic' && e.target instanceof HTMLInputElement) {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // בדיקת גודל הקובץ (מקסימום 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('גודל הקובץ חורג מהמגבלה המותרת (10MB)');
        return;
      }
      
      setSelectedFile(file);
      
      // הצגת תצוגה מקדימה לתמונות
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      
      // הגדרת כותרת אוטומטית אם לא הוגדרה
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name }));
      }
      
      setErrorMessage('');
    }
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  
  const handleTagAdd = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };
  
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };
  
  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setErrorMessage('נא לבחור קובץ להעלאה');
      return;
    }
    
    setIsUploading(true);
    
    // בסביבה אמיתית - כאן היה קוד ששולח את הקובץ לשרת
    // במקום זאת, נדמה העלאה מוצלחת
    
    try {
      // דימוי השהייה של העלאה
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // יצירת אובייקט מסמך חדש (בסביבה אמיתית היה מגיע מהשרת)
      const newDocument: Document = {
        id: Math.floor(Math.random() * 1000),
        title: formData.title || selectedFile.name,
        memberId: formData.associatedMemberId || 0,
        type: getDocumentType(selectedFile.type),
        url: URL.createObjectURL(selectedFile), // דרך זמנית להגדיר נתיב
        uploadDate: new Date().toISOString(),
        uploadedBy: 1, // במציאות לקחת מהמשתמש המחובר
        tags: tags
      };
      
      onUploadComplete(newDocument);
      resetForm();
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('אירעה שגיאה בהעלאת הקובץ');
    } finally {
      setIsUploading(false);
    }
  };
  
  const getDocumentType = (mimeType: string): 'pdf' | 'image' | 'doc' => {
    if (supportedFileTypes.image.includes(mimeType)) {
      return 'image';
    } else if (mimeType === 'application/pdf') {
      return 'pdf';
    } else {
      return 'doc';
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'אחר',
      isPublic: true,
      associatedMemberId: 0
    });
    setSelectedFile(null);
    setFilePreview(null);
    setTags([]);
    setTagInput('');
    setErrorMessage('');
    
    // איפוס שדה הקובץ
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // עדכון הדומה לשינוי קובץ רגיל
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('גודל הקובץ חורג מהמגבלה המותרת (10MB)');
        return;
      }
      
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name }));
      }
      
      setErrorMessage('');
      
      // עדכון שדה הקובץ
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };
  
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">העלאת קובץ חדש</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          aria-label="סגור"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              filePreview ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {filePreview ? (
              <div className="relative">
                <img src={filePreview} alt="Preview" className="max-h-60 mx-auto rounded" />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setFilePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="h-12 w-12 text-gray-400 mx-auto" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M24 10v28m-14-14h28" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="text-gray-600">גרור לכאן קובץ, או לחץ לבחירה</div>
                <div className="text-gray-500 text-sm">PNG, JPG, PDF, DOC, XLS עד 10MB</div>
              </div>
            )}
            <input
              type="file"
              className="sr-only"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
          </div>
          
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-500">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-2 text-sm text-red-500">
              {errorMessage}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              כותרת
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="כותרת המסמך"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              תיאור
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="תיאור המסמך (אופציונלי)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                קטגוריה
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="תעודות">תעודות</option>
                <option value="מסמכים רשמיים">מסמכים רשמיים</option>
                <option value="מסמכים רפואיים">מסמכים רפואיים</option>
                <option value="תמונות">תמונות</option>
                <option value="חשבונות">חשבונות</option>
                <option value="מסמכי לימודים">מסמכי לימודים</option>
                <option value="מתכונים">מתכונים</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="associatedMemberId" className="block text-sm font-medium text-gray-700 mb-1">
                שייך לחבר משפחה
              </label>
              <select
                id="associatedMemberId"
                name="associatedMemberId"
                value={formData.associatedMemberId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>כל המשפחה</option>
                {familyData.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תגיות
            </label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagKeyPress}
                className="flex-1 p-2 border border-gray-300 rounded-r-none rounded-l-md focus:ring-2 focus:ring-indigo-500"
                placeholder="הוסף תגית..."
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 py-2 bg-indigo-600 text-white rounded-l-none rounded-r-md hover:bg-indigo-700"
              >
                הוסף
              </button>
            </div>
            
            <div className="flex flex-wrap mt-2 gap-2">
              <AnimatePresence>
                {tags.map(tag => (
                  <motion.span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1.5 text-indigo-600 hover:text-indigo-900"
                    >
                      &times;
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              נגיש לכל חברי המשפחה
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isUploading}
          >
            ביטול
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-md text-white ${
              isUploading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מעלה...
              </span>
            ) : (
              'העלאה'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
} 