const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { setTenantFromUser } = require('../middleware/tenantHandler');

router.get('/', protect, setTenantFromUser, getSuppliers);
router.post('/', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), createSupplier);
router.put('/:id', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateSupplier);
router.delete('/:id', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), deleteSupplier);

module.exports = router;