// מודל מסמכים למסד הנתונים

import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'נא למלא כותרת למסמך'],
      trim: true,
      maxlength: [100, 'כותרת המסמך לא יכולה לעבור 100 תווים']
    },
    description: {
      type: String,
      maxlength: [500, 'תיאור המסמך לא יכול לעבור 500 תווים']
    },
    fileType: {
      type: String,
      enum: ['image', 'document', 'pdf', 'spreadsheet', 'presentation', 'other'],
      default: 'document'
    },
    mimeType: {
      type: String
    },
    originalFilename: {
      type: String
    },
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true
    },
    associatedWith: {
      // למי המסמך שייך (אופציונלי)
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      memberName: String
    },
    isPublic: {
      // האם המסמך נגיש לכל בני המשפחה
      type: Boolean,
      default: true
    },
    accessibleTo: [
      {
        // אם לא ציבורי, למי מותר לצפות
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    category: {
      type: String,
      enum: [
        'תעודות', 
        'מסמכים רשמיים', 
        'מסמכים רפואיים', 
        'תמונות', 
        'חשבונות', 
        'מסמכי לימודים',
        'מתכונים',
        'אחר'
      ],
      default: 'אחר'
    },
    tags: [String],
    expiryDate: {
      type: Date
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// וידוא שהתיקיות קיימות לפני שמירת מסמך
DocumentSchema.pre('save', function (next) {
  // במיישום אמיתי, כאן היה קוד שמוודא שהתיקייה קיימת, או יוצר אותה
  next();
});

// מתודה לקבלת URL למסמך
DocumentSchema.methods.getUrl = function () {
  return `/api/documents/${this._id}`;
};

// מתודה לבדיקה אם משתמש רשאי לצפות במסמך
DocumentSchema.methods.canAccess = function (userId) {
  // אם המסמך ציבורי, כל חבר משפחה יכול לצפות בו
  if (this.isPublic) return true;
  
  // אם המסמך שייך למשתמש הזה
  if (this.uploadedBy.toString() === userId.toString()) return true;
  
  // אם המשתמש ברשימת הגישה
  return this.accessibleTo.some(id => id.toString() === userId.toString());
};

// וירטואל שדה להורדה קלה
DocumentSchema.virtual('downloadUrl').get(function () {
  return `/api/documents/${this._id}/download`;
});

// יש לבדוק אם המודל כבר קיים לפני יצירתו
const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default Document; 