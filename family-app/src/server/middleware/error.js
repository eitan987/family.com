// מידלוור לטיפול בשגיאות וניסוח תגובות שגיאה

import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // תיעוד השגיאה לקונסול
  console.log(err.stack.red);

  // שגיאת מונגוס - מזהה שגוי
  if (err.name === 'CastError') {
    const message = `משאב עם מזהה ${err.value} לא נמצא`;
    error = new ErrorResponse(message, 404);
  }

  // שגיאת מונגוס - שדה ייחודי
  if (err.code === 11000) {
    let field = Object.keys(err.keyValue)[0];
    let value = err.keyValue[field];
    let hebrewField;
    
    // המרת שמות שדות לעברית
    switch (field) {
      case 'email':
        hebrewField = 'כתובת האימייל';
        break;
      case 'username':
        hebrewField = 'שם המשתמש';
        break;
      default:
        hebrewField = field;
    }
    
    const message = `${hebrewField} '${value}' כבר קיים במערכת`;
    error = new ErrorResponse(message, 400);
  }

  // שגיאת מונגוס - שדות חובה
  if (err.name === 'ValidationError') {
    // איסוף כל הודעות השגיאה
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `נתונים לא תקינים: ${messages.join('. ')}`;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'שגיאת שרת'
  });
};

export default errorHandler; 