const mongoose = require('mongoose');

const ResetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: [true, 'Token Hash is required'],
    unique: true,
  },
  used: {
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
    expires: 900, // 15 Minutes TTL index in MongoDB
  },
});

module.exports = mongoose.model('ResetToken', ResetTokenSchema);
