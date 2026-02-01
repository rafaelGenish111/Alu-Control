const express = require('express');
const router = express.Router();
const { loginUser, createUser, getAllUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { setTenantFromUser } = require('../middleware/tenantHandler');

// Login – publicly accessible (tenantId optional in body, default: default_glass_dynamics)
router.post('/login', loginUser);

// Create new user – protected + tenant context
router.post('/create-user', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), createUser);

// Admin-only endpoint to get all users
router.get('/users', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), getAllUsers);

// Admin-only endpoint to update a user
router.put('/users/:id', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateUser);

// Admin-only endpoint to delete a user
router.delete('/users/:id', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), deleteUser);

module.exports = router;