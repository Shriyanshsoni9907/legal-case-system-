const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

/**
 * Middleware to protect API endpoints and authenticate the user session
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Retrieve the token from Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to gain access.', 401));
    }

    // 2) Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
    }

    // 3) Find the user associated with the token ID
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Grant access and attach user details to request context
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to restrict route access to specific roles (e.g., 'Admin', 'Lawyer')
 * @param {...string} roles - List of allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
