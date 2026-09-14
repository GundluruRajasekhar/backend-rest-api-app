const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const router = Router();
const mongoIdParam = param('id').isMongoId().withMessage('id must be a valid Mongo ObjectId');

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ min: 2, max: 150 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('owner').isMongoId().withMessage('owner must be a valid Mongo ObjectId'),
    body('status').optional().isIn(['active', 'archived']),
  ],
  validate,
  createProject
);

router.get(
  '/',
  [
    query('owner').optional().isMongoId(),
    query('status').optional().isIn(['active', 'archived']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getProjects
);

router.get('/:id', [mongoIdParam], validate, getProjectById);

router.patch(
  '/:id',
  [
    mongoIdParam,
    body('name').optional().trim().isLength({ min: 2, max: 150 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(['active', 'archived']),
  ],
  validate,
  updateProject
);

router.delete('/:id', [mongoIdParam], validate, deleteProject);

module.exports = router;
