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
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Rate Limited Security & OTP Routes
const otpLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
