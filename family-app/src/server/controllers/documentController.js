// בקר מסמכים - מטפל בהעלאה, הורדה וניהול של מסמכים משפחתיים

import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import Document from '../models/Document.js';
import Family from '../models/Family.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import { fileURLToPath } from 'url';

// המרת פונקציות callback לפרומיסים
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

// קבלת הנתיב לתיקיית האחסון
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../../uploads');

// וידוא שתיקיית האחסון קיימת
const ensureUploadDirExists = async () => {
  try {
    if (!await existsAsync(uploadDir)) {
      await mkdirAsync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating upload directory:', err);
  }
};

// קבלת תיקיית אחסון למשפחה
const getFamilyUploadPath = async (familyId) => {
  const familyDir = path.join(uploadDir, familyId.toString());
  if (!await existsAsync(familyDir)) {
    await mkdirAsync(familyDir, { recursive: true });
  }
  return familyDir;
};

// @desc    קבלת כל המסמכים של משפחה
// @route   GET /api/documents
// @access  Private
export const getDocuments = asyncHandler(async (req, res, next) => {
  const { familyId, category, fileType, isImportant, search } = req.query;
  
  // וידוא שהמשתמש שייך למשפחה
  if (familyId) {
    const family = await Family.findById(familyId);
    if (!family) {
      return next(new ErrorResponse(`משפחה עם מזהה ${familyId} לא נמצאה`, 404));
    }
    
    const isMember = family.members.some(
      member => member.userId.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return next(new ErrorResponse('אין הרשאה לצפות במסמכי משפחה זו', 403));
    }
  }
  
  // בניית שאילתה
  const query = { familyId };
  
  // פילטרים
  if (category) {
    query.category = category;
  }
  
  if (fileType) {
    query.fileType = fileType;
  }
  
  if (isImportant === 'true') {
    query.isImportant = true;
  }
  
  // חיפוש טקסטואלי
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { originalFilename: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }
  
  // גישה מוגבלת למסמכים פרטיים
  const privateDocsQuery = {
    isPublic: false,
    uploadedBy: { $ne: req.user.id },
    accessibleTo: { $nin: [req.user.id] }
  };
  
  // שילוב תנאי הגישה בשאילתה
  const finalQuery = {
    $and: [
      query,
      { $nor: [privateDocsQuery] }
    ]
  };
  
  // ביצוע השאילתה
  const documents = await Document.find(finalQuery)
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents
  });
});

// @desc    קבלת מסמך יחיד
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    return next(new ErrorResponse(`מסמך עם מזהה ${req.params.id} לא נמצא`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה של המסמך
  const family = await Family.findById(document.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const isMember = family.members.some(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return next(new ErrorResponse('אין הרשאה לצפות במסמך זה', 403));
  }
  
  // בדיקת הרשאת גישה למסמך
  if (!document.isPublic && 
      document.uploadedBy.toString() !== req.user.id.toString() && 
      !document.accessibleTo.includes(req.user.id)) {
    return next(new ErrorResponse('אין לך הרשאת גישה למסמך זה', 403));
  }
  
  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    העלאת מסמך חדש
// @route   POST /api/documents
// @access  Private
export const uploadDocument = asyncHandler(async (req, res, next) => {
  await ensureUploadDirExists();
  
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('נא להעלות קובץ', 400));
  }
  
  const { familyId, title, description, category, tags, isPublic, associatedWith } = req.body;
  
  // וידוא שהמשתמש שייך למשפחה
  const family = await Family.findById(familyId);
  
  if (!family) {
    return next(new ErrorResponse(`משפחה עם מזהה ${familyId} לא נמצאה`, 404));
  }
  
  const isMember = family.members.some(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return next(new ErrorResponse('אין הרשאה להעלות מסמכים למשפחה זו', 403));
  }
  
  const file = req.files.file;
  
  // בדיקת סוג הקובץ
  const fileExt = path.extname(file.name).toLowerCase();
  let fileType = 'other';
  
  // זיהוי סוג הקובץ לפי סיומת
  if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(fileExt)) {
    fileType = 'image';
  } else if (['.pdf'].includes(fileExt)) {
    fileType = 'pdf';
  } else if (['.doc', '.docx', '.txt', '.rtf'].includes(fileExt)) {
    fileType = 'document';
  } else if (['.xls', '.xlsx', '.csv'].includes(fileExt)) {
    fileType = 'spreadsheet';
  } else if (['.ppt', '.pptx'].includes(fileExt)) {
    fileType = 'presentation';
  }
  
  // יצירת שם קובץ ייחודי
  const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
  
  // קבלת נתיב אחסון למשפחה
  const familyUploadPath = await getFamilyUploadPath(familyId);
  const filePath = path.join(familyUploadPath, uniqueFilename);
  
  // העברת הקובץ לתיקיית היעד
  await file.mv(filePath);
  
  // עיבוד תגיות אם קיימות
  const parsedTags = tags ? JSON.parse(tags) : [];
  
  // עיבוד פרטי המשתמש המשויך
  let associatedWithData = {};
  if (associatedWith) {
    try {
      const parsedData = JSON.parse(associatedWith);
      associatedWithData = {
        memberId: parsedData.memberId,
        memberName: parsedData.memberName
      };
    } catch (err) {
      console.error('Error parsing associatedWith data:', err);
    }
  }
  
  // יצירת רשומת מסמך במסד הנתונים
  const document = await Document.create({
    title: title || file.name,
    description,
    fileType,
    mimeType: file.mimetype,
    originalFilename: file.name,
    filename: uniqueFilename,
    path: filePath,
    size: file.size,
    uploadedBy: req.user.id,
    familyId,
    category: category || 'אחר',
    tags: parsedTags,
    isPublic: isPublic === 'false' ? false : true,
    associatedWith: associatedWithData
  });
  
  res.status(201).json({
    success: true,
    data: document
  });
});

// @desc    עדכון פרטי מסמך
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = asyncHandler(async (req, res, next) => {
  let document = await Document.findById(req.params.id);
  
  if (!document) {
    return next(new ErrorResponse(`מסמך עם מזהה ${req.params.id} לא נמצא`, 404));
  }
  
  // וידוא שהמשתמש הוא בעל המסמך או מנהל משפחה
  if (document.uploadedBy.toString() !== req.user.id.toString()) {
    const family = await Family.findById(document.familyId);
    
    if (!family) {
      return next(new ErrorResponse('משפחה לא נמצאה', 404));
    }
    
    const member = family.members.find(
      member => member.userId.toString() === req.user.id.toString()
    );
    
    if (!member || !member.isAdmin) {
      return next(new ErrorResponse('אין לך הרשאה לעדכן מסמך זה', 403));
    }
  }
  
  // עיבוד תגיות אם קיימות
  if (req.body.tags && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (err) {
      console.error('Error parsing tags:', err);
      req.body.tags = [];
    }
  }
  
  // עיבוד פרטי המשתמש המשויך
  if (req.body.associatedWith && typeof req.body.associatedWith === 'string') {
    try {
      const parsedData = JSON.parse(req.body.associatedWith);
      req.body.associatedWith = {
        memberId: parsedData.memberId,
        memberName: parsedData.memberName
      };
    } catch (err) {
      console.error('Error parsing associatedWith data:', err);
      delete req.body.associatedWith;
    }
  }
  
  // עדכון המסמך
  document = await Document.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    מחיקת מסמך
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    return next(new ErrorResponse(`מסמך עם מזהה ${req.params.id} לא נמצא`, 404));
  }
  
  // וידוא שהמשתמש הוא בעל המסמך או מנהל משפחה
  if (document.uploadedBy.toString() !== req.user.id.toString()) {
    const family = await Family.findById(document.familyId);
    
    if (!family) {
      return next(new ErrorResponse('משפחה לא נמצאה', 404));
    }
    
    const member = family.members.find(
      member => member.userId.toString() === req.user.id.toString()
    );
    
    if (!member || !member.isAdmin) {
      return next(new ErrorResponse('אין לך הרשאה למחוק מסמך זה', 403));
    }
  }
  
  // ניסיון למחוק את הקובץ מהדיסק
  try {
    await unlinkAsync(document.path);
  } catch (err) {
    console.error(`Error deleting file ${document.path}:`, err);
    // ממשיך גם אם המחיקה מהדיסק נכשלה
  }
  
  // מחיקת הרשומה ממסד הנתונים
  await document.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    הורדת מסמך
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    return next(new ErrorResponse(`מסמך עם מזהה ${req.params.id} לא נמצא`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה של המסמך
  const family = await Family.findById(document.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const isMember = family.members.some(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return next(new ErrorResponse('אין הרשאה להוריד מסמך זה', 403));
  }
  
  // בדיקת הרשאת גישה למסמך
  if (!document.isPublic && 
      document.uploadedBy.toString() !== req.user.id.toString() && 
      !document.accessibleTo.includes(req.user.id)) {
    return next(new ErrorResponse('אין לך הרשאת גישה למסמך זה', 403));
  }
  
  // בדיקה שהקובץ קיים בדיסק
  try {
    if (!await existsAsync(document.path)) {
      return next(new ErrorResponse('הקובץ לא נמצא במערכת', 404));
    }
  } catch (err) {
    console.error(`Error checking file existence ${document.path}:`, err);
    return next(new ErrorResponse('שגיאה בגישה לקובץ', 500));
  }
  
  // שליחת הקובץ להורדה
  res.download(document.path, document.originalFilename);
});

// @desc    שיתוף מסמך עם משתמשים אחרים במשפחה
// @route   PUT /api/documents/:id/share
// @access  Private
export const shareDocument = asyncHandler(async (req, res, next) => {
  const { userIds } = req.body;
  
  if (!userIds || !Array.isArray(userIds)) {
    return next(new ErrorResponse('נא לספק רשימה של מזהי משתמשים לשיתוף', 400));
  }
  
  let document = await Document.findById(req.params.id);
  
  if (!document) {
    return next(new ErrorResponse(`מסמך עם מזהה ${req.params.id} לא נמצא`, 404));
  }
  
  // וידוא שהמשתמש הוא בעל המסמך
  if (document.uploadedBy.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('רק בעל המסמך יכול לשתף אותו', 403));
  }
  
  // וידוא שהמשתמשים שייכים למשפחה
  const family = await Family.findById(document.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const familyMemberIds = family.members.map(member => member.userId.toString());
  
  // סינון רק משתמשים שהם חברי משפחה
  const validUserIds = userIds.filter(id => familyMemberIds.includes(id.toString()));
  
  // עדכון רשימת המשתמשים המורשים
  document.isPublic = false;
  document.accessibleTo = validUserIds;
  
  await document.save();
  
  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    יצירת תיקייה חדשה לאחסון מסמכים
// @route   POST /api/documents/folder
// @access  Private
export const createFolder = asyncHandler(async (req, res, next) => {
  const { familyId, folderName } = req.body;
  
  if (!familyId || !folderName) {
    return next(new ErrorResponse('נא לספק מזהה משפחה ושם תיקייה', 400));
  }
  
  // וידוא שהמשתמש שייך למשפחה
  const family = await Family.findById(familyId);
  
  if (!family) {
    return next(new ErrorResponse(`משפחה עם מזהה ${familyId} לא נמצאה`, 404));
  }
  
  const isMember = family.members.some(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return next(new ErrorResponse('אין הרשאה ליצור תיקיות במשפחה זו', 403));
  }
  
  // יצירת נתיב תיקייה
  const sanitizedFolderName = folderName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const folderPath = path.join(uploadDir, familyId.toString(), sanitizedFolderName);
  
  try {
    await mkdirAsync(folderPath, { recursive: true });
    
    res.status(201).json({
      success: true,
      data: {
        folderName: sanitizedFolderName,
        path: folderPath
      }
    });
  } catch (err) {
    console.error(`Error creating folder ${folderPath}:`, err);
    return next(new ErrorResponse('שגיאה ביצירת תיקייה', 500));
  }
}); 