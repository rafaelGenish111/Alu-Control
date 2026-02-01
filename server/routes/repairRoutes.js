const express = require('express');
const router = express.Router();

const {
  createRepair,
  getRepairs,
  getRepairById,
  updateRepair,
  addRepairNote,
  addRepairMedia,
  approveRepair,
  scheduleRepair,
  closeRepair,
  updateRepairIssue,
  updateRepairTakeList
} = require('../controllers/repairController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { setTenantFromUser } = require('../middleware/tenantHandler');

router.get('/', protect, setTenantFromUser, getRepairs);
router.post('/', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), createRepair);

router.get('/:id', protect, setTenantFromUser, getRepairById);
router.put('/:id', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateRepair);

router.post('/:id/notes', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office', 'installer'), addRepairNote);
router.post('/:id/media', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office', 'installer'), addRepairMedia);

router.post('/:id/approve', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), approveRepair);
router.post('/:id/schedule', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), scheduleRepair);
router.post('/:id/close', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), closeRepair);

router.put('/:id/issue', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office'), updateRepairIssue);
router.put('/:id/install-take-list', protect, setTenantFromUser, authorize('super_admin', 'admin', 'office', 'installer'), updateRepairTakeList);

module.exports = router;





