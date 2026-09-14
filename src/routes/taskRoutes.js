const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const Task = require('../models/Task');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');

const router = Router();
const mongoIdParam = param('id').isMongoId().withMessage('id must be a valid Mongo ObjectId');
const statusValues = Task.STATUSES; // ['todo', 'in-progress', 'done']

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('title is required').isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('project').isMongoId().withMessage('project must be a valid Mongo ObjectId'),
    body('assignee').optional().isMongoId().withMessage('assignee must be a valid Mongo ObjectId'),
    body('status').optional().isIn(statusValues).withMessage(`status must be one of: ${statusValues.join(', ')}`),
    body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
  ],
  validate,
  createTask
);

router.get(
  '/',
  [
    query('project').optional().isMongoId(),
    query('assignee').optional().isMongoId(),
    query('status').optional().isIn(statusValues),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getTasks
);

router.get('/:id', [mongoIdParam], validate, getTaskById);

router.patch(
  '/:id',
  [
    mongoIdParam,
    body('title').optional().trim().isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('assignee').optional({ nullable: true }).isMongoId(),
    body('dueDate').optional({ nullable: true }).isISO8601(),
  ],
  validate,
  updateTask
);

// Dedicated status-transition endpoint, per the "task status management" requirement
router.patch(
  '/:id/status',
  [
    mongoIdParam,
    body('status')
      .notEmpty()
      .withMessage('status is required')
      .isIn(statusValues)
      .withMessage(`status must be one of: ${statusValues.join(', ')}`),
  ],
  validate,
  updateTaskStatus
);

router.delete('/:id', [mongoIdParam], validate, deleteTask);

module.exports = router;
