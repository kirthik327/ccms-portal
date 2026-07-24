// Simple in-memory sliding window rate limiter for security endpoints
const requestCounts = new Map();

const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 Minutes
  const maxRequests = options.max || 5; // Max 5 requests per window
  const message = options.message || 'Too many attempts. Please wait a few minutes before trying again.';

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'global';
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const timestamps = requestCounts.get(key).filter((timestamp) => now - timestamp < windowMs);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    timestamps.push(now);
    requestCounts.set(key, timestamps);
    next();
  };
};

module.exports = rateLimiter;
