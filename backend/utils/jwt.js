const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token containing the user's ID
 * @param {string} id - The user ID to encode in the token
 * @returns {string} Signed JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { signToken };
