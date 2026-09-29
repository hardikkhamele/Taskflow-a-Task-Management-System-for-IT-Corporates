const express = require('express');
const { check } = require('express-validator');
const {
  createTask,
  getTasks,
  getDashboardStats,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// Apply auth protection to all task routes
router.use(protect);

// Dashboard Statistics Route
router.get('/stats', getDashboardStats);

// Task CRUD Routes
router
  .route('/')
  .get(getTasks)
  .post(
    authorize('Admin', 'Manager'),
    [
      check('projectName', 'Project name is required').not().isEmpty().trim(),
      check('taskName', 'Task name is required').not().isEmpty().trim(),
      check('assignedTo', 'Assigned user ID is required').not().isEmpty(),
      check('status', 'Invalid status')
        .optional()
        .isIn(['Pending', 'On Going', 'Completed']),
      check('priority', 'Invalid priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']),
      check('dueDate', 'Due date is required').not().isEmpty(),
      validate,
    ],
    createTask
  );

router
  .route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(authorize('Admin', 'Manager'), deleteTask);

module.exports = router;
