const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { setTenantFromUser } = require('../middleware/tenantHandler');

router.get('/', protect, setTenantFromUser, getProducts);
router.post('/', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), createProduct);
router.delete('/:id', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), deleteProduct);

module.exports = router;