const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: Checks either HttpOnly cookie or Authorization Bearer header
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Or check signed/secure cookie
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

    // Fetch user from DB to ensure user exists
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
 * Role-based authorization guard
 * @param  {...string} roles 
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to authorized roles.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
