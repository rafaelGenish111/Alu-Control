const express = require('express');
const router = express.Router();
const { loginUser, createUser, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Login – publicly accessible
router.post('/login', loginUser);

// Create new user – protected:
// 1. protect: must be authenticated
// 2. authorize: must have role super_admin or admin
router.post('/create-user', protect, authorize('super_admin', 'admin'), createUser);

// Admin-only endpoint to get all users (wired in router)
router.get('/users', protect, authorize('super_admin', 'admin'), getAllUsers);

module.exports = router;