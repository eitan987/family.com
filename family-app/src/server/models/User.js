// מודל משתמשים למסד הנתונים

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'נא למלא שם'],
      trim: true,
      maxlength: [50, 'השם לא יכול לעבור 50 תווים']
    },
    email: {
      type: String,
      required: [true, 'נא למלא כתובת אימייל'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'נא להזין כתובת אימייל תקינה'
      ]
    },
    password: {
      type: String,
      required: [true, 'נא למלא סיסמה'],
      minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים'],
      select: false
    },
    role: {
      type: String,
      enum: ['משתמש', 'מנהל משפחה', 'אדמין'],
      default: 'משתמש'
    },
    families: [
      {
        familyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Family'
        },
        role: {
          type: String,
          enum: ['הורה', 'ילד', 'בן/בת זוג', 'סבא/סבתא', 'אחר'],
          default: 'אחר'
        },
        isAdmin: {
          type: Boolean,
          default: false
        }
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: Date,
    avatar: {
      type: String,
      default: 'default-avatar.png'
    },
    phoneNumber: {
      type: String,
      match: [/^05\d-?\d{7}$/, 'נא להזין מספר טלפון תקין']
    },
    preferences: {
      language: {
        type: String,
        enum: ['he', 'en'],
        default: 'he'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        }
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      }
    }
  },
  {
    timestamps: true
  }
);

// הצפנת סיסמא לפני שמירה
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// השוואת סיסמא מוזנת עם סיסמא מוצפנת
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// חתימת JWT והחזרתו
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'secret_should_be_in_env_file',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// יצירת אסימון לאיפוס סיסמה
UserSchema.methods.getResetPasswordToken = function() {
  // יצירת אסימון
  const resetToken = crypto.randomBytes(20).toString('hex');

  // הצפנת האסימון ושמירתו
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // הגדרת זמן פקיעת תוקף - 10 דקות
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// יצירת אסימון לאימות אימייל
UserSchema.methods.getEmailVerificationToken = function() {
  // יצירת אסימון
  const emailToken = crypto.randomBytes(20).toString('hex');

  // הצפנת האסימון ושמירתו
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(emailToken)
    .digest('hex');

  return emailToken;
};

// יש לבדוק אם המודל כבר קיים לפני יצירתו
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User; 