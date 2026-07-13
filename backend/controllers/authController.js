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

