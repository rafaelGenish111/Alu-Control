const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSuppliers);
router.post('/', protect, authorize('super_admin'), createSupplier); // הגנה: רק סופר אדמין
router.delete('/:id', protect, authorize('super_admin'), deleteSupplier);

module.exports = router;