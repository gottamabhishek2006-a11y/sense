const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createIssue,
  getAllIssues,
  updateIssueStatus,
  getPublicIssues,
} = require('../controllers/issueController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Rate limit for issue submissions
const issueSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    success: false,
    message: 'Too many issue submissions. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────

/**
 * GET /api/issues/public
 * Returns recent issues without sensitive data or images (for public feed)
 */
router.get('/public', getPublicIssues);

/**
 * POST /api/issues
 * Submit a new civic issue (with optional image as data URL).
 * Optionally authenticated (logged-in citizens get their name attached).
 * Rate-limited. Backend validates image format and size.
 */
router.post('/', issueSubmitLimiter, (req, res, next) => {
  // Try to get user from JWT if provided, but don't reject unauthenticated requests
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.civicfix_token;

  if (authHeader?.startsWith('Bearer ') || cookieToken) {
    // Optional auth — attach user if valid token provided
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const token = authHeader ? authHeader.split(' ')[1] : cookieToken;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id)
        .select('-password')
        .then((user) => {
          if (user) req.user = user;
          createIssue(req, res, next);
        })
        .catch(() => createIssue(req, res, next));
    } catch {
      // Invalid token is fine — proceed as anonymous
      createIssue(req, res, next);
    }
  } else {
    createIssue(req, res, next);
  }
});

// ─────────────────────────────────────────────────────
// ADMIN-ONLY ROUTES (requireAuth + requireAdmin)
// Both middleware run — backend fully enforces role
// ─────────────────────────────────────────────────────

/**
 * GET /api/issues/admin
 * Returns ALL issues with full data including imageUrl (admin review)
 * Citizen token → 403 Forbidden
 * Invalid/missing token → 401 Unauthorized
 */
router.get('/admin', requireAuth, requireAdmin, getAllIssues);

/**
 * PATCH /api/issues/admin/:ticketId/status
 * Update the status of an issue (admin dispatching / resolving)
 * Citizen token → 403 Forbidden
 */
router.patch('/admin/:ticketId/status', requireAuth, requireAdmin, updateIssueStatus);

module.exports = router;
