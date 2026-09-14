const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = Router();
const mongoIdParam = param('id').isMongoId().withMessage('id must be a valid Mongo ObjectId');

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().withMessage('a valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'member']).withMessage('role must be admin or member'),
  ],
  validate,
  createUser
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getUsers
);

router.get('/:id', [mongoIdParam], validate, getUserById);

router.patch(
  '/:id',
  [
    mongoIdParam,
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('role').optional().isIn(['admin', 'member']),
  ],
  validate,
  updateUser
);

router.delete('/:id', [mongoIdParam], validate, deleteUser);

module.exports = router;
