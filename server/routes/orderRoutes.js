const express = require('express');
const router = express.Router();
// Import Controllers
const {
    getOrders, createOrder, updateOrderStatus,
    getBatchingList, markAsOrdered,
    getCustomers, getClientHistory, getClientByPhone, getOrderById, addOrderFile
} = require('../controllers/orderController');

// Import NEW Install Controller
const { scheduleInstallation, getInstallersList, approveInstallation } = require('../controllers/installController');

const { protect, authorize } = require('../middleware/authMiddleware');

// --- Existing Routes ---
// חשוב: ראוטים עם path קבוע (כמו /batching) חייבים לבוא לפני ראוטים פרמטריים (/:id)
router.get('/', protect, getOrders);

// Batching & Clients (paths קבועים)
router.get('/batching', protect, getBatchingList);
router.post('/batch-order', protect, authorize('super_admin', 'admin', 'office'), markAsOrdered);
router.get('/customers/list', protect, getCustomers);
router.get('/customers/:name/history', protect, getClientHistory);
router.get('/clients/lookup/:phone', protect, getClientByPhone);

// פעולות לפי מזהה הזמנה
router.get('/:id', protect, getOrderById);
router.post('/', protect, authorize('super_admin', 'admin', 'office'), createOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/files', protect, addOrderFile);

// --- NEW Installation Routes ---
// 1. Get list of installers for the dropdown
router.get('/install/team-list', protect, getInstallersList);

// 2. Assign team & schedule (Manager only)
router.post('/install/schedule', protect, authorize('super_admin', 'admin', 'office'), scheduleInstallation);

// 3. Final approval (Manager only)
router.post('/install/approve', protect, authorize('super_admin', 'admin'), approveInstallation);

module.exports = router;