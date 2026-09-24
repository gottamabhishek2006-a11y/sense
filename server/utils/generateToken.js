const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} id - User MongoDB ID
 * @param {string} role - User role (citizen or admin)
 * @returns {string} - JWT Token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
