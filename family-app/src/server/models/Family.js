// מודל משפחה למסד הנתונים

import mongoose from 'mongoose';
import crypto from 'crypto';

const FamilySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'נא להזין שם משפחה'],
      trim: true,
      maxlength: [50, 'שם המשפחה לא יכול לעבור 50 תווים']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['הורה', 'ילד', 'בן/בת זוג', 'סבא/סבתא', 'אחר'],
          default: 'אחר'
        },
        permissions: {
          canAddTasks: {
            type: Boolean,
            default: true
          },
          canEditTasks: {
            type: Boolean, 
            default: true
          },
          canDeleteTasks: {
            type: Boolean,
            default: false
          },
          canManageMembers: {
            type: Boolean,
            default: false
          }
        },
        joinedAt: {
          type: Date,
          default: Date.now
        },
        nickname: {
          type: String,
          trim: true
        },
        isAdmin: {
          type: Boolean,
          default: false
        }
      }
    ],
    invites: [
      {
        email: {
          type: String,
          required: true
        },
        token: {
          type: String,
          required: true
        },
        expiresAt: {
          type: Date,
          required: true
        },
        role: {
          type: String,
          enum: ['הורה', 'ילד', 'בן/בת זוג', 'סבא/סבתא', 'אחר'],
          default: 'אחר'
        }
      }
    ],
    settings: {
      color: {
        type: String,
        default: '#3B82F6' // כחול ברירת מחדל
      },
      icon: {
        type: String,
        default: 'family'
      },
      timezone: {
        type: String,
        default: 'Asia/Jerusalem'
      },
      allowChildrenToInvite: {
        type: Boolean,
        default: false
      },
      privacyLevel: {
        type: String,
        enum: ['פתוח', 'מוגבל', 'פרטי'],
        default: 'פרטי'
      }
    },
    description: {
      type: String,
      maxlength: [500, 'התיאור לא יכול לעבור 500 תווים']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'ישראל'
      }
    },
    importantDates: [
      {
        title: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          required: true
        },
        description: String,
        recurring: {
          type: Boolean,
          default: true
        },
        type: {
          type: String,
          enum: ['יום הולדת', 'יום נישואין', 'חג', 'אחר'],
          default: 'אחר'
        }
      }
    ],
    premium: {
      type: Boolean,
      default: false
    },
    subscriptionExpiresAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// שדות וירטואליים
FamilySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

FamilySchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'familyId',
  justOne: false
});

// למנוע הכללת הזמנות פגות תוקף בתוצאות
FamilySchema.pre(/^find/, function(next) {
  this.invites = this.invites.filter(invite => invite.expiresAt > Date.now());
  next();
});

// כאשר משתמש יוצר משפחה, להוסיף אותו כחבר ראשון
FamilySchema.pre('save', async function(next) {
  if (this.isNew) {
    // אם המסמך חדש וחברי המשפחה ריק, להוסיף את היוצר
    if (this.members.length === 0 && this.createdBy) {
      this.members.push({
        userId: this.createdBy,
        role: 'הורה',
        permissions: {
          canAddTasks: true,
          canEditTasks: true,
          canDeleteTasks: true,
          canManageMembers: true
        },
        isAdmin: true
      });
    }
  }
  next();
});

// פונקציה להוספת חבר משפחה
FamilySchema.methods.addMember = async function(userId, role = 'אחר', isAdmin = false) {
  // בדיקה אם המשתמש כבר קיים
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );

  if (existingMember) {
    return false;
  }

  // הוספת המשתמש למשפחה
  this.members.push({
    userId,
    role,
    isAdmin,
    permissions: {
      canAddTasks: true,
      canEditTasks: true,
      canDeleteTasks: isAdmin,
      canManageMembers: isAdmin
    }
  });

  await this.save();
  return true;
};

// פונקציה ליצירת הזמנה
FamilySchema.methods.createInvite = function(email, role = 'אחר') {
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // שבוע

  this.invites.push({
    email,
    token,
    expiresAt,
    role
  });

  return token;
};

// יש לבדוק אם המודל כבר קיים לפני יצירתו
const Family = mongoose.models.Family || mongoose.model('Family', FamilySchema);

export default Family; 