'use client';

import React from 'react';
import { Document } from '@/types';

interface DocumentItemProps {
  document: Document;
  isSelected: boolean;
  onDocumentClick: (doc: Document) => void;
  onDeleteDocument: (docId: number) => void;
  getMemberName: (id: number) => string;
  getDocumentTypeLabel: (type: string) => string;
  formatDate: (date: string) => string;
}

export default function DocumentItem({
  document,
  isSelected,
  onDocumentClick,
  onDeleteDocument,
  getMemberName,
  getDocumentTypeLabel,
  formatDate,
}: DocumentItemProps) {
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case 'image':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'doc':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('האם אתה בטוח שברצונך למחוק מסמך זה?')) {
      onDeleteDocument(document.id);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert('פתיחת מסמך: ' + document.title);
    // במימוש אמיתי היינו פותחים את המסמך בחלון חדש או מציגים אותו
  };

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onDocumentClick(document)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getDocumentIcon(document.type)}</div>
          <div className="mr-3">
            <h3 className="font-medium">{document.title}</h3>
            <p className="text-sm text-gray-500">
              <span className="font-medium">שייך ל: </span>
              {getMemberName(document.memberId)}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            {getDocumentTypeLabel(document.type)}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs text-gray-500">
          <span className="font-medium">תאריך העלאה: </span>
          {formatDate(document.uploadDate)}
        </p>

        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={handleView}
          className="px-3 py-1 text-sm font-medium rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          צפייה
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 text-sm font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          מחיקה
        </button>
      </div>
    </div>
  );
} 