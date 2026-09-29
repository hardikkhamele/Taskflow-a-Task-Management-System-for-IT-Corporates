const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// Register Route
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty().trim(),
    check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be Admin, Manager, or Employee')
      .optional()
      .isIn(['Admin', 'Manager', 'Employee']),
    validate,
  ],
  registerUser
);

// Login Route
router.post(
  '/login',
  [
    check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    validate,
  ],
  loginUser
);

// Logged-in User Profile Routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Get All Users Route
router.get('/users', protect, getAllUsers);

// Admin User Management Routes
router.route('/users/:id')
  .put(protect, authorize('Admin'), updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;
