const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  checkEmail,
  signup,
  login,
  getMe,
  logout,
  healthCheck,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Abuse protection: Rate limiting for email checking
const emailCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 email checks per window per IP
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Abuse protection: Rate limiting for signup & login attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login/signup attempts per window per IP
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.get('/health', healthCheck);
router.post('/check-email', emailCheckLimiter, checkEmail);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected routes (Requires valid Bearer token or HttpOnly cookie)
router.get('/me', protect, getMe);

// Role-protected admin endpoint
router.get('/admin-check', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the CivicFix Municipal Administrative Console.',
    user: req.user,
  });
});

module.exports = router;
