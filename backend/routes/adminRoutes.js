const express = require('express');
const {
  getDashboardStats,
  assignComplaint,
  updateComplaintStatus,
  getStaffList,
  getStudentsList,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/stats', getDashboardStats);
router.get('/staff', getStaffList);
router.get('/students', getStudentsList);
router.put('/assign/:id', assignComplaint);
router.put('/status/:id', updateComplaintStatus);

module.exports = router;
