// מידלוור אימות והרשאות

import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';

// הגנה על נתיבים - מאפשר גישה רק למשתמשים מאומתים
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // בדיקת האם יש אסימון JWT בכותרת Authorization או בעוגיות
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // שליפת האסימון מכותרת
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // שליפת האסימון מעוגיות
    token = req.cookies.token;
  }

  // וידוא שהאסימון קיים
  if (!token) {
    return next(new ErrorResponse('אין הרשאה לגשת למשאב זה', 401));
  }

  try {
    // אימות האסימון
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_should_be_in_env_file');

    // שליפת המשתמש על סמך האסימון והוספתו לאובייקט הבקשה
    req.user = await User.findById(decoded.id);

    // אם לא נמצא משתמש עם המזהה מהאסימון
    if (!req.user) {
      return next(new ErrorResponse('משתמש לא נמצא', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('אין הרשאה לגשת למשאב זה', 401));
  }
});

// הגבלת גישה לפי תפקיד
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `תפקיד ${req.user.role} אינו מורשה לגשת למשאב זה`,
          403
        )
      );
    }
    next();
  };
};

// וידוא חברות במשפחה
export const isFamilyMember = asyncHandler(async (req, res, next) => {
  const { familyId } = req.params;

  // בדיקה אם המשתמש שייך למשפחה
  const isMember = req.user.families.some(
    family => family.familyId.toString() === familyId
  );

  if (!isMember) {
    return next(
      new ErrorResponse('אינך חבר במשפחה זו ולכן אין לך הרשאה לגשת למשאב', 403)
    );
  }

  next();
});

// וידוא הרשאות ניהול במשפחה
export const isFamilyAdmin = asyncHandler(async (req, res, next) => {
  const { familyId } = req.params;

  // חיפוש המשפחה ברשימת המשפחות של המשתמש
  const family = req.user.families.find(
    family => family.familyId.toString() === familyId
  );

  if (!family) {
    return next(
      new ErrorResponse('אינך חבר במשפחה זו ולכן אין לך הרשאה לגשת למשאב', 403)
    );
  }

  // בדיקה אם המשתמש הוא מנהל במשפחה
  if (!family.isAdmin) {
    return next(
      new ErrorResponse('אין לך הרשאות ניהול במשפחה זו', 403)
    );
  }

  next();
}); 