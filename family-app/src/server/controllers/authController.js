// בקר אימות - מטפל בהרשמה, התחברות וניהול משתמשים

import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// @desc    הרשמת משתמש חדש
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // יצירת משתמש
  const user = await User.create({
    name,
    email,
    password
  });

  // יצירת אסימון לאימות אימייל
  const emailToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // יצירת URL לאימות אימייל
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${emailToken}`;
  const message = `נרשמת בהצלחה לאפליקציית משפחה! אנא אמת את כתובת האימייל שלך על ידי לחיצה על הקישור הבא: \n\n ${verifyUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'אימות כתובת אימייל',
      message
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('לא ניתן לשלוח אימייל אימות', 500));
  }
});

// @desc    התחברות משתמש
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // וידוא שהוזנו אימייל וסיסמה
  if (!email || !password) {
    return next(new ErrorResponse('יש להזין כתובת אימייל וסיסמה', 400));
  }

  // חיפוש המשתמש
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('פרטי התחברות שגויים', 401));
  }

  // וידוא התאמת הסיסמה
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('פרטי התחברות שגויים', 401));
  }

  // עדכון תאריך התחברות אחרונה
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    התנתקות משתמש / ניקוי עוגייה
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    קבלת המשתמש הנוכחי
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    עדכון פרטי משתמש
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber
  };

  // סינון שדות ריקים
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    עדכון סיסמה
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // בדיקת הסיסמה הנוכחית
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('סיסמה נוכחית שגויה', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    שכחתי סיסמה
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('לא נמצא משתמש עם כתובת אימייל זו', 404));
  }

  // קבלת אסימון איפוס
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // יצירת URL לאיפוס
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
  const message = `נתקבלה בקשה לאיפוס סיסמה. כדי לאפס את הסיסמה שלך, לחץ על הקישור הבא: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'איפוס סיסמה',
      message
    });

    res.status(200).json({ success: true, data: 'האימייל נשלח בהצלחה' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('לא ניתן לשלוח אימייל איפוס', 500));
  }
});

// @desc    איפוס סיסמה
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // קבלת אסימון מוצפן
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('אסימון לא תקין או פג תוקף', 400));
  }

  // הגדרת הסיסמה החדשה
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    אימות אימייל
// @route   GET /api/auth/verifyemail/:verificationtoken
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  // קבלת אסימון מוצפן
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationtoken)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken
  });

  if (!user) {
    return next(new ErrorResponse('אסימון לא תקין', 400));
  }

  // עדכון סטטוס אימות
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'האימייל אומת בהצלחה',
    data: {}
  });
});

// @desc    בקשה לשליחת אימייל אימות מחדש
// @route   POST /api/auth/resendverification
// @access  Private
export const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.emailVerified) {
    return next(new ErrorResponse('האימייל כבר אומת', 400));
  }

  // יצירת אסימון חדש
  const emailToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // יצירת URL לאימות
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${emailToken}`;
  const message = `אנא אמת את כתובת האימייל שלך על ידי לחיצה על הקישור הבא: \n\n ${verifyUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'אימות כתובת אימייל',
      message
    });

    res.status(200).json({ success: true, data: 'האימייל נשלח בהצלחה' });
  } catch (err) {
    console.log(err);
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('לא ניתן לשלוח אימייל אימות', 500));
  }
});

// Helper להחזרת אסימון בתגובה
const sendTokenResponse = (user, statusCode, res) => {
  // יצירת אסימון
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
}; 