// נתיבי API למשימות

import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  assignTask,
  unassignTask
} from '../controllers/taskController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// הגנה על כל הנתיבים
router.use(protect);

// נתיבים בסיסיים
router
  .route('/')
  .get(getTasks)
  .post(createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// נתיבים נוספים
router.route('/:id/complete').put(toggleTaskCompletion);
router.route('/:id/assign').put(assignTask);
router.route('/:id/unassign').put(unassignTask);

export default router; 