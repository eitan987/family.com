// נתיבי API למסמכים

import express from 'express';
import {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  shareDocument,
  createFolder
} from '../controllers/documentController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// הגנה על כל הנתיבים
router.use(protect);

// נתיבי תיקיות
router.route('/folder')
  .post(createFolder);

// נתיבים בסיסיים
router.route('/')
  .get(getDocuments)
  .post(uploadDocument);

router.route('/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

// נתיבים נוספים
router.route('/:id/download')
  .get(downloadDocument);

router.route('/:id/share')
  .put(shareDocument);

export default router; 