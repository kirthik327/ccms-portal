const User = require('../models/User');
const OTP = require('../models/OTP');
const ResetToken = require('../models/ResetToken');
const jwt = require('jsonwebtoken');
const { generateOTP, hashSHA256, generateResetToken } = require('../utils/otp');
const { sendOTPEmail } = require('../config/emailService');

// Helper to generate and send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'ccms_jwt_secret_key_2026_secure', {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      employeeId: user.employeeId,
      year: user.year,
    },
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, year, rollNumber, role } = req.body;

    // Block admin registration attempts
    if (role && role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Administrator registration is disabled. Admin accounts are pre-configured by the college.',
      });
    }

    if (!name || !email || !password || !department || !rollNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Enforce register number validation (must start with 7210 and contain only numbers) for students
    if (!rollNumber.startsWith('7210') || !/^\d+$/.test(rollNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Student Register Number must start with 7210 and contain only numbers',
      });
    }

    // Check if email already registered
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Check if register number (rollNumber) already registered
    const rollNumberExists = await User.findOne({ rollNumber });
    if (rollNumberExists) {
      return res.status(400).json({ success: false, message: 'Register Number already registered' });
    }

    // Register user - force role to student
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      department,
      year: year || 'N/A',
      rollNumber,
      role: 'student',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // accepts register number OR email address

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
    }

    // Check for user: by rollNumber (Register Number) OR by email
    let user;
    if (email.startsWith('7210') && /^\d+$/.test(email)) {
      user = await User.findOne({ rollNumber: email }).select('+password');
    } else {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, department, year, employeeId } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (department) fieldsToUpdate.department = department;

    if (req.user.role === 'student') {
      if (email) {
        if (!email.includes('@')) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address',
          });
        }
        fieldsToUpdate.email = email.toLowerCase();
      }
      if (year) fieldsToUpdate.year = year;
    } else {
      if (email) fieldsToUpdate.email = email.toLowerCase();
      if (employeeId) fieldsToUpdate.employeeId = employeeId;
    }

    // Check if email is already taken by another user
    if (email && email.toLowerCase() !== req.user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        employeeId: user.employeeId,
        year: user.year,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to email for password recovery
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered college email' });
    }

    const normalizedEmail = email.toLowerCase();

    // Standardized generic message to prevent account enumeration
    const genericResponse = {
      success: true,
      message: 'If an account exists with this email address, a verification code has been sent.',
    };

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return generic success to prevent account enumeration
      return res.status(200).json(genericResponse);
    }

    // Invalidate/delete any existing active OTP for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Generate cryptographically secure 6-digit OTP
    const plainOtp = generateOTP();
    const otpHash = hashSHA256(plainOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes Expiry

    await OTP.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
    });

    try {
      await sendOTPEmail(normalizedEmail, plainOtp);
    } catch (emailErr) {
      console.error('Failed to dispatch OTP email:', emailErr.message);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify 6-digit OTP and generate short-lived Password Reset Token
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and verification code' });
    }

    const normalizedEmail = email.toLowerCase();
    const otpRecord = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        reason: 'EXPIRED',
        message: 'This OTP has expired. Please generate a new OTP.',
      });
    }

    // Check expiration
    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        reason: 'EXPIRED',
        message: 'This OTP has expired. Please generate a new OTP.',
      });
    }

    // Check attempts limit (max 3)
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        reason: 'MAX_ATTEMPTS',
        message: 'Too many incorrect attempts. Please generate a new OTP.',
      });
    }

    // Compare SHA-256 hash of submitted OTP
    const submittedHash = hashSHA256(otp);
    if (submittedHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          reason: 'MAX_ATTEMPTS',
          message: 'Too many incorrect attempts. Please generate a new OTP.',
        });
      }

      return res.status(400).json({
        success: false,
        reason: 'INVALID_OTP',
        message: 'Invalid OTP. Please check the code and try again.',
      });
    }

    // Match Successful - Invalidate OTP and generate ResetToken
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate secure 64-char reset token
    const plainResetToken = generateResetToken();
    const tokenHash = hashSHA256(plainResetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes TTL

    await ResetToken.deleteMany({ email: normalizedEmail });
    await ResetToken.create({
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    });

    res.status(200).json({
      success: true,
      message: 'Email Verified Successfully',
      resetToken: plainResetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP to email with 60s cooldown
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide registered email' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingOtp = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (existingOtp) {
      const secondsSinceCreation = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (secondsSinceCreation < 60) {
        const remaining = Math.ceil(60 - secondsSinceCreation);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting a new OTP.`,
        });
      }
      await OTP.deleteOne({ _id: existingOtp._id });
    }

    const plainOtp = generateOTP();
    const otpHash = hashSHA256(plainOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
    });

    try {
      await sendOTPEmail(normalizedEmail, plainOtp);
    } catch (emailErr) {
      console.error('Failed to resend OTP email:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email address, a new verification code has been sent.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password after OTP verification using secure Reset Token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide reset token and new password' });
    }

    // Password validation: Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    const tokenHash = hashSHA256(resetToken);
    const resetTokenRecord = await ResetToken.findOne({ tokenHash, used: false });

    if (!resetTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new OTP.',
      });
    }

    if (Date.now() > new Date(resetTokenRecord.expiresAt).getTime()) {
      await ResetToken.deleteOne({ _id: resetTokenRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Password reset token has expired. Please request a new OTP.',
      });
    }

    const user = await User.findOne({ email: resetTokenRecord.email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Update password (pre-save hook hashes with bcrypt)
    user.password = newPassword;
    await user.save();

    // Invalidate reset token and any remaining OTPs
    await ResetToken.deleteOne({ _id: resetTokenRecord._id });
    await OTP.deleteMany({ email: user.email });

    res.status(200).json({
      success: true,
      message: 'Your password has been updated successfully. You can now log in using your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
