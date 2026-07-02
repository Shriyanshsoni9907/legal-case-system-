const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Lawyer = require('../models/lawyerModel');
const AppError = require('../utils/appError');
const { signToken } = require('../utils/jwt');

/**
 * Controller for user registration (Signup)
 */
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1) Input validation
    if (!name || !email || !password || !role) {
      return next(new AppError('Please provide all registration fields: name, email, password, role.', 400));
    }

    if (role !== 'Admin' && role !== 'Lawyer') {
      return next(new AppError('Invalid role assignment. Allowed roles: Admin, Lawyer.', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long.', 400));
    }

    // 2) Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('Email address is already in use by another user.', 400));
    }

    // 3) Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    // 4) If role is Lawyer, automatically instantiate a Lawyer profile
    if (role === 'Lawyer') {
      await Lawyer.create({
        userId: user.id,
        phone: req.body.phone || '',
        specialization: req.body.specialization || '',
        status: 'Active',
      });
    }

    // 5) Generate JWT token
    const token = signToken(user.id);

    // 6) Send response
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller for user authentication (Login)
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Input validation
    if (!email || !password) {
      return next(new AppError('Please provide your email address and password.', 400));
    }

    // 2) Verify user exists & password is correct
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return next(new AppError('Incorrect email or password.', 401));
    }

    // 3) Generate token and send response
    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to fetch the authenticated user's profile information
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    
    let lawyerProfile = null;
    if (user.role === 'Lawyer') {
      lawyerProfile = await Lawyer.findByUserId(user.id);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          lawyerProfile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
