const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getProducts);
router.post('/', protect, authorize('super_admin', 'admin'), createProduct);
router.delete('/:id', protect, authorize('super_admin', 'admin'), deleteProduct);

module.exports = router;