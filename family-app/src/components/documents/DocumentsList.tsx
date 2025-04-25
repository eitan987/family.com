import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from '../../types/Document';
import DocumentViewer from './DocumentViewer';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  IoDocumentTextOutline, 
  IoImageOutline, 
  IoAttachOutline, 
  IoFilterOutline,
  IoCloseOutline,
  IoAddOutline,
  IoSearchOutline
} from 'react-icons/io5';

// Dummy data for demonstration
const documentsData: Document[] = [
  {
    id: '1',
    name: 'תעודת זהות',
    uploadDate: new Date('2023-05-10'),
    uploadedBy: 'אבא',
    type: 'pdf',
    url: '/documents/id-card.pdf',
    tags: ['מסמכים רשמיים', 'משפחה'],
    size: 2457600, // 2.4MB
    description: 'צילום של תעודת הזהות'
  },
  {
    id: '2',
    name: 'תמונת משפחה',
    uploadDate: new Date('2023-07-15'),
    uploadedBy: 'אמא',
    type: 'image',
    url: '/documents/family-photo.jpg',
    tags: ['תמונות', 'משפחה'],
    size: 5242880, // ~5MB
    description: 'תמונת המשפחה מהטיול לצפון'
  },
  {
    id: '3',
    name: 'חוזה שכירות',
    uploadDate: new Date('2023-02-22'),
    uploadedBy: 'אבא',
    type: 'pdf',
    url: '/documents/rental-agreement.pdf',
    tags: ['חוזים', 'דיור'],
    size: 3670016, // ~3.5MB
    description: 'חוזה השכירות של הדירה'
  },
  {
    id: '4',
    name: 'אישור ביטוח',
    uploadDate: new Date('2023-09-05'),
    uploadedBy: 'אמא',
    type: 'pdf',
    url: '/documents/insurance.pdf',
    tags: ['ביטוח', 'מסמכים רשמיים'],
    size: 1048576, // 1MB
    description: 'אישור הביטוח השנתי'
  },
  {
    id: '5',
    name: 'תמונה מטיול',
    uploadDate: new Date('2023-08-12'),
    uploadedBy: 'ילד',
    type: 'image',
    url: '/documents/trip-photo.jpg',
    tags: ['תמונות', 'טיולים'],
    size: 4194304, // 4MB
    description: 'תמונה מהטיול האחרון'
  }
];

// Available tags for filtering
const availableTags = ['מסמכים רשמיים', 'משפחה', 'תמונות', 'חוזים', 'דיור', 'ביטוח', 'טיולים'];

const DocumentsList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(documentsData);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Filter and sort documents when criteria change
  useEffect(() => {
    let filtered = [...documents];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(doc => 
        selectedTags.some(tag => doc.tags.includes(tag))
      );
    }
    
    // Filter by document type
    if (selectedType) {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }
    
    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedTags, selectedType, sortBy, sortOrder]);

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle document deletion
  const handleDeleteDocument = (id: string) => {
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
    setSelectedDocument(null);
  };

  // Get icon based on document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <IoDocumentTextOutline className="text-red-500 text-xl" />;
      case 'image':
        return <IoImageOutline className="text-blue-500 text-xl" />;
      default:
        return <IoAttachOutline className="text-gray-500 text-xl" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full h-full overflow-hidden flex flex-col">
      <h2 className="text-2xl font-bold text-right mb-4">מסמכים</h2>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 justify-end">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="חיפוש מסמכים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-md text-right"
          />
          <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-md"
        >
          {showFilters ? <IoCloseOutline /> : <IoFilterOutline />}
          <span>{showFilters ? 'סגור סינון' : 'סינון'}</span>
        </button>
        
        <button className="flex items-center gap-1 py-2 px-4 bg-green-100 text-green-600 rounded-md">
          <IoAddOutline />
          <span>העלה מסמך</span>
        </button>
      </div>
      
      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 rounded-md p-4 mb-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sort Options */}
              <div className="text-right">
                <label className="block mb-2 font-medium">מיין לפי:</label>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy as 'date' | 'name' | 'size');
                      setSortOrder(newSortOrder as 'asc' | 'desc');
                    }}
                    className="p-2 border border-gray-300 rounded-md text-right w-full"
                  >
                    <option value="date-desc">תאריך (מהחדש לישן)</option>
                    <option value="date-asc">תאריך (מהישן לחדש)</option>
                    <option value="name-asc">שם (א-ת)</option>
                    <option value="name-desc">שם (ת-א)</option>
                    <option value="size-desc">גודל (מהגדול לקטן)</option>
                    <option value="size-asc">גודל (מהקטן לגדול)</option>
                  </select>
                </div>
              </div>
              
              {/* Document Type Filter */}
              <div className="text-right">
                <label className="block mb-2 font-medium">סוג מסמך:</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-right w-full"
                >
                  <option value="">הכל</option>
                  <option value="pdf">PDF</option>
                  <option value="image">תמונות</option>
                </select>
              </div>
              
              {/* Tags Filter */}
              <div className="text-right">
                <label className="block mb-2 font-medium">תגיות:</label>
                <div className="flex flex-wrap gap-2 justify-end">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag) 
                            : [...prev, tag]
                        );
                      }}
                      className={`py-1 px-3 rounded-full text-sm ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Document List */}
      <div className="overflow-y-auto flex-grow">
        {filteredDocuments.length > 0 ? (
          <ul className="space-y-2">
            <AnimatePresence>
              {filteredDocuments.map(doc => (
                <motion.li
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  onClick={() => setSelectedDocument(doc)}
                  className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      {getDocumentIcon(doc.type)}
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <div className="text-left text-sm text-gray-500">
                      {doc.uploadedBy}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {format(doc.uploadDate, 'dd בMMMM yyyy', { locale: he })}
                    </div>
                  </div>
                  
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 justify-end">
                      {doc.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-gray-500"
          >
            <p>לא נמצאו מסמכים התואמים את החיפוש</p>
          </motion.div>
        )}
      </div>
      
      {/* Document Viewer Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <DocumentViewer 
                document={selectedDocument} 
                onClose={() => setSelectedDocument(null)}
                onDelete={handleDeleteDocument}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsList; 