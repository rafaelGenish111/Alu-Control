const express = require('express');
const router = express.Router();
// Import Controllers
const {
    getOrders, createOrder, updateOrderStatus,
    getBatchingList, markAsOrdered,
    getCustomers, getClientHistory, getClientByPhone, getOrderById, addOrderFile, searchClients, getPendingMaterials, markMaterialOrdered, getPurchasingStatus, toggleMaterialArrival,
    updateFinalInvoice,
    addOrderNote,
    updateProduction,
    updateProducts,
    updateMaterials,
    updateInstallTakeList,
    updateOrderIssue,
    updateClientDetails,
    updateOrderGeneral,
    searchOrders,
    getDeletedOrders,
    restoreOrder,
    cleanupDeletedOrders
} = require('../controllers/orderController');

// Import NEW Install Controller
const { scheduleInstallation, getInstallersList, approveInstallation, updateInstallers } = require('../controllers/installController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { setTenantFromUser } = require('../middleware/tenantHandler');

// לוג לכל בקשה שמגיעה ל-orderRoutes
router.use((req, res, next) => {
    console.log(`🔵 [orderRoutes] ${req.method} ${req.path}`);
    next();
});

// --- Existing Routes ---
// חשוב: ראוטים עם path קבוע (כמו /batching) חייבים לבוא לפני ראוטים פרמטריים (/:id)
router.get('/', protect, setTenantFromUser, getOrders);

// Global search (must come before /:id)
router.get('/search', protect, setTenantFromUser, searchOrders);

// Deleted orders management (must come before /:id)
router.get('/deleted', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), getDeletedOrders);
router.post('/deleted/cleanup', protect, setTenantFromUser, authorize('super_admin', 'admin'), cleanupDeletedOrders);

// Batching & Clients (paths קבועים)
router.get('/clients/search', protect, setTenantFromUser, searchClients);
router.get('/batching', protect, setTenantFromUser, getBatchingList);
router.post('/batch-order', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), markAsOrdered);
router.get('/customers/list', protect, setTenantFromUser, getCustomers);
router.get('/customers/:name/history', protect, setTenantFromUser, getClientHistory);
router.get('/clients/lookup/:phone', protect, setTenantFromUser, getClientByPhone);

router.get('/procurement/pending', protect, setTenantFromUser, getPendingMaterials); // רשימת המתנה להזמנה
router.post('/procurement/order-item', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), markMaterialOrdered); // ביצוע הזמנה
router.get('/procurement/tracking', protect, setTenantFromUser, getPurchasingStatus); // דף Purchasing
router.post('/procurement/arrive-item', protect, setTenantFromUser, authorize('super_admin', 'admin', 'production'), toggleMaterialArrival); // סימון הגעה (V)

// --- NEW Installation Routes ---
// 1. Get list of installers for the dropdown
router.get('/install/team-list', protect, setTenantFromUser, getInstallersList);

// 2. Assign team & schedule (Manager only)
router.post('/install/schedule', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), scheduleInstallation);

// 3. Update installers and dates (Manager only)
router.put('/:id/installers', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateInstallers);

// 4. Final approval (Manager only)
router.post('/install/approve', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), approveInstallation);

// פעולות לפי מזהה הזמנה (must stay after fixed routes)
router.post('/', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), createOrder);
router.put('/:id/status', protect, setTenantFromUser, updateOrderStatus);
router.put('/:id/client', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateClientDetails);
router.put('/:id', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateOrderGeneral);
router.put('/:id/production', protect, setTenantFromUser, authorize('super_admin', 'admin', 'production'), updateProduction);
router.put('/:id/products', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateProducts);
router.put('/:id/materials', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateMaterials);
router.put('/:id/install-take-list', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office', 'production', 'installer'), updateInstallTakeList);
router.put('/:id/issue', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateOrderIssue);
router.put('/:id/final-invoice', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateFinalInvoice);
router.post('/:id/notes', protect, setTenantFromUser, addOrderNote);
router.put('/:id/files', protect, setTenantFromUser, addOrderFile);
router.post('/:id/restore', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), restoreOrder);
router.get('/:id', protect, setTenantFromUser, getOrderById);

module.exports = router;