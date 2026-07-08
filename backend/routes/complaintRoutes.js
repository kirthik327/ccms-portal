const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  addReply,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(upload.single('image'), createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaintById)
  .put(upload.single('image'), updateComplaint)
  .delete(deleteComplaint);

router.post('/:id/reply', addReply);

module.exports = router;
