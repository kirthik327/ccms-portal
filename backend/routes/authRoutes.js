const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// OTP & Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
