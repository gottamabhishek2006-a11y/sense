const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * requireAuth: Verifies JWT from Bearer header or HttpOnly cookie.
 * Sets req.user on success. Returns 401 on failure.
 */
const requireAuth = async (req, res, next) => {
  let token;

  // 1. Check Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Or check HttpOnly cookie
  else if (req.cookies && req.cookies.civicfix_token) {
    token = req.cookies.civicfix_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch user from DB to ensure the account still exists
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this session no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please sign in again.',
        isExpired: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Please sign in again.',
    });
  }
};

/**
 * requireAdmin: Must be used AFTER requireAuth.
 * Independently verifies the authenticated user has role === 'admin'
 * on the backend from the DB record — never trusts frontend claims.
 * Returns 403 Forbidden for non-admin authenticated users.
 */
const requireAdmin = (req, res, next) => {
  // req.user is guaranteed to exist because requireAuth ran first
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrative authorization required.',
    });
  }
  next();
};

/**
 * Legacy alias: authorize(...roles) — role-based authorization guard.
 * Kept for backward compatibility. Prefer requireAdmin for admin-only routes.
 * @param  {...string} roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access restricted to authorized roles.',
      });
    }
    next();
  };
};

// protect = requireAuth (backward compatibility alias)
const protect = requireAuth;

module.exports = { protect, authorize, requireAuth, requireAdmin };
