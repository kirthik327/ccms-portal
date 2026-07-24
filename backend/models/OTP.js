const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: [true, 'OTP Hash is required'],
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 Minutes TTL index in MongoDB
  },
});

module.exports = mongoose.model('OTP', OTPSchema);
