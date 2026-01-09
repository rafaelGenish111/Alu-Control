const express = require('express');
const router = express.Router();
const { loginUser, createUser, getAllUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Login – publicly accessible
router.post('/login', loginUser);

// Create new user – protected:
// 1. protect: must be authenticated
// 2. authorize: must have role super_admin, admin, or office
router.post('/create-user', protect, authorize('super_admin', 'admin', 'office'), createUser);

// Admin-only endpoint to get all users (wired in router)
router.get('/users', protect, authorize('super_admin', 'admin', 'office'), getAllUsers);

// Admin-only endpoint to update a user (wired in router)   
router.put('/users/:id', protect, authorize('super_admin', 'admin', 'office'), updateUser);

// Admin-only endpoint to delete a user (wired in router)
router.delete('/users/:id', protect, authorize('super_admin', 'admin', 'office'), deleteUser);

module.exports = router;