'use client';

import React, { useState, useEffect } from 'react';
import { documentsData, familyData } from '@/data/mock-data';
import { Document, FamilyMember } from '@/types';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import DocumentItem from './DocumentItem';
import UploadDocumentForm from './UploadDocumentForm';

export default function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filterByMember, setFilterByMember] = useState<number | 'all'>('all');
  const [filterByType, setFilterByType] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    // המרת הנתונים לטיפוס המתאים
    const typedDocumentsData = documentsData.map(doc => ({
      ...doc,
      type: doc.type as 'pdf' | 'image' | 'doc'
    }));
    setDocuments(typedDocumentsData);
  }, []);

  const handleAddDocument = (newDoc: Document) => {
    const docWithId = {
      ...newDoc,
      id: documents.length > 0 ? Math.max(...documents.map((d) => d.id)) + 1 : 1,
    };
    setDocuments([...documents, docWithId]);
    setShowUploadForm(false);
  };

  const handleDeleteDocument = (docId: number) => {
    setDocuments(documents.filter((doc) => doc.id !== docId));
    if (selectedDocument?.id === docId) {
      setSelectedDocument(null);
    }
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc === selectedDocument ? null : doc);
  };

  // פילטור המסמכים לפי הפילטרים הנוכחיים
  const filteredDocuments = documents.filter((doc) => {
    const matchesMember = filterByMember === 'all' || doc.memberId === filterByMember;
    const matchesType = filterByType === 'all' || doc.type === filterByType;
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMember && matchesType && matchesSearch;
  });

  const getMemberName = (id: number): string => {
    const member = familyData.members.find((m) => m.id === id);
    return member ? member.firstName : 'לא ידוע';
  };

  const getDocumentTypeLabel = (type: string): string => {
    switch (type) {
      case 'pdf':
        return 'מסמך PDF';
      case 'image':
        return 'תמונה';
      case 'doc':
        return 'מסמך Word';
      default:
        return 'קובץ אחר';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "d בMMMM yyyy", { locale: he });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">סינון מסמכים</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
                חיפוש
              </label>
              <input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                placeholder="חפש לפי כותרת או תגיות..."
              />
            </div>

            <div>
              <label
                htmlFor="filterByMember"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                שייך ל
              </label>
              <select
                id="filterByMember"
                value={filterByMember}
                onChange={(e) =>
                  setFilterByMember(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="input-field"
              >
                <option value="all">כל בני המשפחה</option>
                {familyData.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filterByType" className="block text-sm font-medium text-gray-700 mb-1">
                סוג מסמך
              </label>
              <select
                id="filterByType"
                value={filterByType}
                onChange={(e) => setFilterByType(e.target.value)}
                className="input-field"
              >
                <option value="all">כל הסוגים</option>
                <option value="pdf">PDF</option>
                <option value="image">תמונה</option>
                <option value="doc">מסמך Word</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="w-full btn btn-primary flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {showUploadForm ? 'ביטול' : 'העלאת מסמך חדש'}
            </button>
          </div>
        </div>

        {showUploadForm && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">העלאת מסמך חדש</h2>
            <UploadDocumentForm
              onAddDocument={handleAddDocument}
              onCancel={() => setShowUploadForm(false)}
            />
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                isSelected={selectedDocument?.id === doc.id}
                onDocumentClick={handleDocumentClick}
                onDeleteDocument={handleDeleteDocument}
                getMemberName={getMemberName}
                getDocumentTypeLabel={getDocumentTypeLabel}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">אין מסמכים התואמים את הסינון שבחרת</p>
          </div>
        )}
      </div>
    </div>
  );
} 