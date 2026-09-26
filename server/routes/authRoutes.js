const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  checkEmail,
  signup,
  login,
  adminLogin,
  getMe,
  logout,
  healthCheck,
} = require('../controllers/authController');
const { requireAuth, requireAdmin, authorize } = require('../middleware/authMiddleware');

// Rate limiting for email checks
const emailCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for login/signup attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for admin login endpoint
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 attempts per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many admin login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────

router.get('/health', healthCheck);
router.post('/check-email', emailCheckLimiter, checkEmail);

// Citizen signup — backend ALWAYS assigns role: 'citizen', never trusts client role
router.post('/signup', authLimiter, signup);

// Citizen login — backend returns role in JWT, frontend redirects accordingly
router.post('/login', authLimiter, login);

router.post('/logout', logout);

// ─────────────────────────────────────────────────────
// ADMIN AUTHENTICATION (separate endpoint, stricter limits)
// Not linked in public UI — admin must know this URL
// Backend independently verifies admin status; hiding URL is NOT security
// ─────────────────────────────────────────────────────

/**
 * POST /api/auth/admin/login
 * Dedicated admin login endpoint.
 * - Validates credentials against the single authorized admin account
 * - Backend verifies role === 'admin' independently
 * - Never returns password or exposes admin identity to other users
 */
router.post('/admin/login', adminAuthLimiter, adminLogin);

// ─────────────────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────────────────

router.get('/me', requireAuth, getMe);

/**
 * GET /api/auth/admin-check
 * Verifies the currently authenticated user is the authorized admin.
 * requireAuth verifies JWT, requireAdmin verifies role === 'admin' from DB.
 * Citizen token → 403 Forbidden. Missing/invalid token → 401 Unauthorized.
 */
router.get('/admin-check', requireAuth, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the CivicSense Municipal Administrative Console.',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
