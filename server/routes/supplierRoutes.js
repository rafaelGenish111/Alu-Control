const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSuppliers);
router.post('/', protect, authorize('super_admin', 'admin', 'office'), createSupplier);
router.put('/:id', protect, authorize('super_admin', 'admin', 'office'), updateSupplier);
router.delete('/:id', protect, authorize('super_admin', 'admin', 'office'), deleteSupplier);

module.exports = router;