const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
    const { email, password } = req.body; // email field can accept register number OR email address

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

// The OTP sending method: outh
const outh = async (email, otp) => {
  try {
    console.log('====================================');
    console.log(`[OUTH OTP SERVICE] Attempting to send OTP via SMTP to: ${email}`);
    console.log('====================================');

    const nodemailer = require('nodemailer');

    const hasUser = process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('your-college-email');
    const hasPass = process.env.EMAIL_PASS && !process.env.EMAIL_PASS.includes('your-gmail-app-password');

    if (!hasUser || !hasPass) {
      throw new Error('SMTP credentials are not configured in your .env file yet. Please set EMAIL_USER and EMAIL_PASS to send real emails.');
    }

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CCMS Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'CCMS Password Reset Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">CCMS Password Reset</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Use the following verification OTP code to complete the reset process. This code will expire in 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 15px;">
            Campus Complaint Management System (CCMS)
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[OUTH OTP SERVICE] Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[OUTH OTP SERVICE] Failed to send email:', error.message);
    let userFriendlyError = 'Failed to send verification email. ';
    if (error.message.includes('535') || error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      userFriendlyError += 'Invalid email login credentials. If you are using Gmail, you must generate and use a 16-character App Password (not your regular account password).';
    } else if (error.code === 'ENOTFOUND' || error.message.includes('EAI_AGAIN') || error.message.includes('connect ECONNREFUSED')) {
      userFriendlyError += 'Could not connect to SMTP server. Please check your internet connectivity.';
    } else {
      userFriendlyError += error.message;
    }
    throw new Error(userFriendlyError);
  }
};

// @desc    Step 1: Send OTP to User's registered email
// @route   POST /api/auth/forgot-password/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
  try {
    const { email, identifier } = req.body; // identifier is Roll Number / Employee ID

    if (!email || !identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your registered email and Roll Number / Employee ID',
      });
    }

    // Find user by email AND rollNumber/employeeId
    const user = await User.findOne({
      email: email.toLowerCase(),
      $or: [{ rollNumber: identifier }, { employeeId: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No matching user found with the provided email and Roll Number / Employee ID',
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to user model
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    // Send OTP using outh method
    await outh(user.email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP is sent to your email',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Step 2: Verify the OTP entered by user
// @route   POST /api/auth/forgot-password/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, identifier, otp } = req.body;

    if (!email || !identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, identifier, and the OTP code',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      $or: [{ rollNumber: identifier }, { employeeId: identifier }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Step 3: Reset password with verified OTP
// @route   POST /api/auth/forgot-password/reset
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, identifier, otp, newPassword } = req.body;

    if (!email || !identifier || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields including the new password',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      $or: [{ rollNumber: identifier }, { employeeId: identifier }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP again
    if (!user.otp || user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP session' });
    }

    // Reset password and clear OTP
    user.password = newPassword;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep legacy forgotPassword mapping for backward compatibility
exports.forgotPassword = exports.sendOTP;
