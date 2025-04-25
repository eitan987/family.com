// בקר משימות - מטפל בבקשות HTTP הקשורות למשימות

import Task from '../models/Task.js';
import Family from '../models/Family.js';
import mongoose from 'mongoose';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    קבלת כל המשימות של משפחה
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res, next) => {
  const { familyId, status, assignedTo, priority, dueDate, sortBy } = req.query;
  
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
      return next(new ErrorResponse('אין הרשאה לצפות במשימות משפחה זו', 403));
    }
  }
  
  // בניית שאילתה
  const query = { familyId };
  
  // פילטרים
  if (status) {
    query.status = status;
  }
  
  if (assignedTo) {
    query['assignedTo.userId'] = assignedTo;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  // פילטור לפי תאריך יעד
  if (dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.dueDate = { $gte: today, $lt: tomorrow };
    } else if (dueDate === 'week') {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      query.dueDate = { $gte: today, $lt: nextWeek };
    } else if (dueDate === 'month') {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      query.dueDate = { $gte: today, $lt: nextMonth };
    } else if (dueDate === 'overdue') {
      query.dueDate = { $lt: today };
      query.status = { $ne: 'הושלם' };
    }
  }
  
  // ביצוע השאילתה
  let taskQuery = Task.find(query);
  
  // מיון
  if (sortBy) {
    const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
    const sortOrder = sortBy.startsWith('-') ? -1 : 1;
    taskQuery = taskQuery.sort({ [sortField]: sortOrder });
  } else {
    // ברירת מחדל: קודם לפי תאריך יעד, אח"כ לפי דחיפות
    taskQuery = taskQuery.sort({ dueDate: 1, priority: -1 });
  }
  
  const tasks = await taskQuery;
  
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// @desc    קבלת משימה יחידה
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return next(new ErrorResponse(`משימה עם מזהה ${req.params.id} לא נמצאה`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה של המשימה
  const family = await Family.findById(task.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const isMember = family.members.some(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return next(new ErrorResponse('אין הרשאה לצפות במשימה זו', 403));
  }
  
  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    יצירת משימה חדשה
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res, next) => {
  // הוספת נתוני יוצר המשימה
  req.body.createdBy = {
    userId: req.user.id,
    name: req.user.name
  };
  
  // וידוא שהמשתמש שייך למשפחה ובעל הרשאות
  const family = await Family.findById(req.body.familyId);
  
  if (!family) {
    return next(new ErrorResponse(`משפחה עם מזהה ${req.body.familyId} לא נמצאה`, 404));
  }
  
  const member = family.members.find(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!member) {
    return next(new ErrorResponse('אין הרשאה ליצור משימות במשפחה זו', 403));
  }
  
  if (!member.permissions.canAddTasks) {
    return next(new ErrorResponse('אין לך הרשאה ליצור משימות', 403));
  }
  
  const task = await Task.create(req.body);
  
  res.status(201).json({
    success: true,
    data: task
  });
});

// @desc    עדכון משימה
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);
  
  if (!task) {
    return next(new ErrorResponse(`משימה עם מזהה ${req.params.id} לא נמצאה`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה ובעל הרשאות
  const family = await Family.findById(task.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const member = family.members.find(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!member) {
    return next(new ErrorResponse('אין הרשאה לעדכן משימות במשפחה זו', 403));
  }
  
  // בדיקה אם יש הרשאת עריכה או אם זו משימה שנוצרה ע"י המשתמש או משוייכת אליו
  const isCreator = task.createdBy.userId.toString() === req.user.id.toString();
  const isAssigned = task.assignedTo && task.assignedTo.some(
    assignee => assignee.userId.toString() === req.user.id.toString()
  );
  
  if (!member.permissions.canEditTasks && !isCreator && !isAssigned) {
    return next(new ErrorResponse('אין לך הרשאה לעדכן משימה זו', 403));
  }
  
  // טיפול בסטטוס "הושלם"
  if (req.body.status === 'הושלם' && task.status !== 'הושלם') {
    req.body.completedAt = new Date();
  } else if (req.body.status && req.body.status !== 'הושלם' && task.status === 'הושלם') {
    req.body.completedAt = null;
  }
  
  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    מחיקת משימה
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return next(new ErrorResponse(`משימה עם מזהה ${req.params.id} לא נמצאה`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה ובעל הרשאות
  const family = await Family.findById(task.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const member = family.members.find(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!member) {
    return next(new ErrorResponse('אין הרשאה למחוק משימות במשפחה זו', 403));
  }
  
  // בדיקה אם יש הרשאת מחיקה או אם זו משימה שנוצרה ע"י המשתמש
  const isCreator = task.createdBy.userId.toString() === req.user.id.toString();
  
  if (!member.permissions.canDeleteTasks && !isCreator) {
    return next(new ErrorResponse('אין לך הרשאה למחוק משימה זו', 403));
  }
  
  await task.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    סימון משימה כהושלמה או לא הושלמה
// @route   PUT /api/tasks/:id/complete
// @access  Private
export const toggleTaskCompletion = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);
  
  if (!task) {
    return next(new ErrorResponse(`משימה עם מזהה ${req.params.id} לא נמצאה`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה
  const family = await Family.findById(task.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const isMember = family.members.some(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return next(new ErrorResponse('אין הרשאה לעדכן משימות במשפחה זו', 403));
  }
  
  // בדיקה אם המשימה משוייכת למשתמש
  const isAssigned = task.assignedTo && task.assignedTo.some(
    assignee => assignee.userId.toString() === req.user.id.toString()
  );
  
  // עדכון סטטוס ותאריך השלמה
  const newStatus = task.status === 'הושלם' ? 'לביצוע' : 'הושלם';
  const completedAt = newStatus === 'הושלם' ? new Date() : null;
  
  task = await Task.findByIdAndUpdate(
    req.params.id,
    { 
      status: newStatus,
      completedAt,
      completedBy: newStatus === 'הושלם' ? {
        userId: req.user.id,
        name: req.user.name
      } : null
    },
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    הקצאת משימה למשתמש
// @route   PUT /api/tasks/:id/assign
// @access  Private
export const assignTask = asyncHandler(async (req, res, next) => {
  const { userId, name } = req.body;
  
  if (!userId) {
    return next(new ErrorResponse('נדרש מזהה משתמש להקצאה', 400));
  }
  
  let task = await Task.findById(req.params.id);
  
  if (!task) {
    return next(new ErrorResponse(`משימה עם מזהה ${req.params.id} לא נמצאה`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה ובעל הרשאות
  const family = await Family.findById(task.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const member = family.members.find(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!member) {
    return next(new ErrorResponse('אין הרשאה לעדכן משימות במשפחה זו', 403));
  }
  
  // וידוא שהמשתמש להקצאה שייך למשפחה
  const targetMember = family.members.find(
    member => member.userId.toString() === userId.toString()
  );
  
  if (!targetMember) {
    return next(new ErrorResponse('המשתמש הנבחר אינו חבר במשפחה זו', 400));
  }
  
  // עדכון המשימה - הוספה לרשימת המוקצים
  let assignedTo = task.assignedTo || [];
  
  // בדיקה אם המשתמש כבר מוקצה למשימה
  const isAlreadyAssigned = assignedTo.some(
    assignee => assignee.userId.toString() === userId.toString()
  );
  
  if (!isAlreadyAssigned) {
    // הוספת המשתמש לרשימת המוקצים
    assignedTo.push({
      userId,
      name: name || targetMember.nickname || 'חבר משפחה'
    });
  }
  
  task = await Task.findByIdAndUpdate(
    req.params.id,
    { assignedTo },
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    הסרת הקצאת משימה ממשתמש
// @route   PUT /api/tasks/:id/unassign
// @access  Private
export const unassignTask = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  
  if (!userId) {
    return next(new ErrorResponse('נדרש מזהה משתמש להסרת הקצאה', 400));
  }
  
  let task = await Task.findById(req.params.id);
  
  if (!task) {
    return next(new ErrorResponse(`משימה עם מזהה ${req.params.id} לא נמצאה`, 404));
  }
  
  // וידוא שהמשתמש שייך למשפחה ובעל הרשאות
  const family = await Family.findById(task.familyId);
  
  if (!family) {
    return next(new ErrorResponse('משפחה לא נמצאה', 404));
  }
  
  const member = family.members.find(
    member => member.userId.toString() === req.user.id.toString()
  );
  
  if (!member) {
    return next(new ErrorResponse('אין הרשאה לעדכן משימות במשפחה זו', 403));
  }
  
  // הסרת המשתמש מרשימת המוקצים
  if (task.assignedTo && task.assignedTo.length > 0) {
    task.assignedTo = task.assignedTo.filter(
      assignee => assignee.userId.toString() !== userId.toString()
    );
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: task.assignedTo },
      {
        new: true,
        runValidators: true
      }
    );
  }
  
  res.status(200).json({
    success: true,
    data: task
  });
}); 