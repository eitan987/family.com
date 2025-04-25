// מודל משימות למסד הנתונים

import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'נא למלא כותרת למשימה'],
      trim: true,
      maxlength: [100, 'כותרת המשימה לא יכולה לעבור 100 תווים']
    },
    description: {
      type: String,
      maxlength: [500, 'תיאור המשימה לא יכול לעבור 500 תווים']
    },
    status: {
      type: String,
      enum: ['לביצוע', 'בתהליך', 'הושלם'],
      default: 'לביצוע'
    },
    priority: {
      type: String,
      enum: ['נמוכה', 'בינונית', 'גבוהה'],
      default: 'בינונית'
    },
    dueDate: {
      type: Date
    },
    assignedTo: {
      memberId: {
        type: Number,
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true
    },
    completedAt: {
      type: Date
    },
    reminder: {
      type: Date
    },
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['יומי', 'שבועי', 'חודשי', 'שנתי'],
        default: 'שבועי'
      },
      endDate: {
        type: Date
      }
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

// וידוא שמשימות מוחזרות ממוינות לפי תאריך יעד
TaskSchema.pre('find', function() {
  this.sort({ dueDate: 1 });
});

// עדכון תאריך השלמה כאשר המשימה מושלמת
TaskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'הושלם' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (this.isModified('status') && this.status !== 'הושלם') {
    this.completedAt = undefined;
  }
  
  next();
});

// יש לבדוק אם המודל כבר קיים לפני יצירתו
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

export default Task; 