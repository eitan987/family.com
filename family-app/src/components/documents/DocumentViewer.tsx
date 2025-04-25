'use client';

import React, { useState } from 'react';
import { Document } from '../../types/Document';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { IoClose, IoDownload, IoShare, IoPrint, IoCalendar, IoPersonCircle, IoInformationCircle, IoTrash, IoDocument, IoImage, IoHelpCircle } from 'react-icons/io5';

interface DocumentViewerProps {
  document: Document | null;
  onClose: () => void;
  onDelete: (docId: string) => void;
  getMemberName?: (id: string) => string;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose, onDelete, getMemberName = (id) => id }) => {
  if (!document) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const handleDownload = () => {
    // בסביבה אמיתית כאן היה קוד להורדת המסמך
    // במקום זאת, נפתח את הקישור בחלון חדש (עובד רק לתמונות/PDFs שהדפדפן יכול להציג)
    window.open(document.url, '_blank');
  };
  
  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק מסמך זה?')) {
      setIsDeleting(true);
      
      // הדמיית השהייה במחיקה
      setTimeout(() => {
        onDelete(document.id);
      }, 500);
    }
  };
  
  const handleShare = () => {
    setIsSharing(true);
    
    // הדמיית שיתוף
    setTimeout(() => {
      alert('המסמך שותף בהצלחה!');
      setIsSharing(false);
    }, 1000);
  };
  
  const formatDate = (date: Date): string => {
    return format(date, "d בMMMM yyyy, HH:mm", { locale: he });
  };
  
  const renderDocumentPreview = () => {
    const lowerType = document.type.toLowerCase();
    
    if (lowerType.includes('pdf')) {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
          <iframe 
            src={document.url} 
            className="w-full h-full rounded-lg" 
            title={document.name}
          />
        </div>
      );
    } else if (lowerType.includes('jpg') || lowerType.includes('jpeg') || lowerType.includes('png') || lowerType.includes('gif')) {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96 overflow-hidden">
          <img 
            src={document.url} 
            alt={document.name} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    } else if (lowerType.includes('doc') || lowerType.includes('txt') || lowerType.includes('xls') || lowerType.includes('ppt')) {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
          <div className="text-center p-6">
            <IoDocument className="text-6xl mx-auto mb-4 text-gray-500" />
            <p className="text-gray-700 text-lg font-semibold">{document.name}</p>
            <p className="text-gray-500">יש להוריד את המסמך כדי לצפות בו</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
          <div className="text-center p-6">
            <IoHelpCircle className="text-6xl mx-auto mb-4 text-gray-500" />
            <p className="text-gray-700">אין אפשרות תצוגה מקדימה לסוג קובץ זה</p>
          </div>
        </div>
      );
    }
  };
  
  const DocumentIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'pdf':
        return <IoDocument className="w-16 h-16 text-red-500" />;
      case 'doc':
      case 'docx':
        return <IoDocument className="w-16 h-16 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <IoImage className="w-16 h-16 text-green-500" />;
      default:
        return <IoHelpCircle className="w-16 h-16 text-gray-500" />;
    }
  };
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-right">{document.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>
        
        <div className="p-5">
          {renderDocumentPreview()}
          
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              <IoDownload /> הורדה
            </button>
            <button 
              onClick={handleShare} 
              className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
            >
              <IoShare /> שיתוף
            </button>
            <button 
              className="flex items-center gap-2 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition"
            >
              <IoPrint /> הדפסה
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
            >
              <IoTrash /> מחיקה
            </button>
          </div>
          
          <div className="mt-6 space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex gap-2 text-sm">
              <IoCalendar className="text-gray-500 mt-1" />
              <div>
                <p className="font-medium text-gray-700">תאריך העלאה:</p>
                <p className="text-gray-600">{formatDate(document.uploadDate)}</p>
              </div>
            </div>
            
            <div className="flex gap-2 text-sm">
              <IoPersonCircle className="text-gray-500 mt-1" />
              <div>
                <p className="font-medium text-gray-700">הועלה על-ידי:</p>
                <p className="text-gray-600">{getMemberName(document.uploadedBy)}</p>
              </div>
            </div>
            
            <div className="flex gap-2 text-sm">
              <IoInformationCircle className="text-gray-500 mt-1" />
              <div>
                <p className="font-medium text-gray-700">מידע נוסף:</p>
                <p className="text-gray-600">סוג: {document.type} | גודל: {formatFileSize(document.size)}</p>
              </div>
            </div>
            
            {document.description && (
              <div className="text-sm mt-2">
                <p className="font-medium text-gray-700">תיאור:</p>
                <p className="text-gray-600">{document.description}</p>
              </div>
            )}
            
            {document.tags && document.tags.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-sm text-gray-700 mb-1">תגיות:</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentViewer; 