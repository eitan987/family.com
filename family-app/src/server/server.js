// קובץ שרת ראשי - מגדיר את האפליקציה, מחבר נתיבים ומתחיל את השרת

import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';

// אימפורט של נתיבים
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
// import familyRoutes from './routes/familyRoutes.js';

// אימפורט של מידלוור
import errorHandler from './middleware/error.js';

// הגדרת משתני סביבה
dotenv.config();

// התחברות למסד הנתונים
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/family-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'.cyan.underline.bold))
.catch(err => console.error(`Error: ${err.message}`.red));

// יצירת אפליקציית אקספרס
const app = express();

// מידלוור לפארסינג גוף בקשות
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// מידלוור להעלאת קבצים
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // הגבלה ל-10MB
  abortOnLimit: true,
  debug: process.env.NODE_ENV === 'development'
}));

// מידלוור CORS
app.use(cors());

// מידלוור לתיעוד בקשות בסביבת פיתוח
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// הגדרת נתיבי API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
// app.use('/api/families', familyRoutes);

// קבלת נתיב לתיקיית האחסון
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

// חשיפת תיקיית האחסון לצפייה ישירה (מוגבל לפי הרשאות)
app.use('/uploads', express.static(uploadsDir));

// בסביבת ייצור, שירות של הקבצים הסטטיים
if (process.env.NODE_ENV === 'production') {
  // הגדרת תיקיית סטטיק
  app.use(express.static(path.join(__dirname, '../client/build')));

  // כל בקשה שאינה לAPI מנותבת לאפליקציית React
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// מידלוור לטיפול בשגיאות
app.use(errorHandler);

// הגדרת פורט והפעלת השרת
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// טיפול בסגירה לא מסודרת של השרת
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // סגירת השרת וסיום התהליך
  server.close(() => process.exit(1));
}); 