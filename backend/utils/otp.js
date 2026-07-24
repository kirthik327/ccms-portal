const crypto = require('crypto');

// Generate 6-digit numeric OTP using cryptographically secure random number generator
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Hash string (OTP or Token) using SHA-256
const hashSHA256 = (data) => {
  return crypto.createHash('sha256').update(data.toString()).digest('hex');
};

// Generate cryptographically secure 64-character random Reset Token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateOTP,
  hashSHA256,
  generateResetToken,
};
