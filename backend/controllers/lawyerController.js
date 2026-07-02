const Lawyer = require('../models/lawyerModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

/**
 * Get the list of all lawyers
 */
exports.getLawyers = async (req, res, next) => {
  try {
    const lawyers = await Lawyer.findAll();
    res.status(200).json({
      status: 'success',
      results: lawyers.length,
      data: { lawyers },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get details for a single lawyer
 */
exports.getLawyer = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return next(new AppError('No lawyer found with that ID.', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { lawyer },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new lawyer user and profile (Admin only)
 */
exports.createLawyer = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, status } = req.body;

    // 1) Input validation
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password for the lawyer.', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long.', 400));
    }

    // 2) Check if email is already in use
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('A user with this email address already exists.', 400));
    }

    // 3) Create user account with role='Lawyer'
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'Lawyer',
    });

    // 4) Create lawyer profile linked to the user account
    const lawyer = await Lawyer.create({
      userId: user.id,
      phone: phone || '',
      specialization: specialization || '',
      status: status || 'Active',
    });

    res.status(201).json({
      status: 'success',
      data: {
        lawyer: {
          id: lawyer.id,
          user_id: user.id,
          name: user.name,
          email: user.email,
          phone: lawyer.phone,
          specialization: lawyer.specialization,
          status: lawyer.status,
          created_at: lawyer.created_at,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing lawyer's profile details (Admin only)
 */
exports.updateLawyer = async (req, res, next) => {
  try {
    const { name, phone, specialization, status } = req.body;
    const lawyerId = req.params.id;

    const updatedLawyer = await Lawyer.update(lawyerId, {
      name,
      phone,
      specialization,
      status,
    });

    if (!updatedLawyer) {
      return next(new AppError('No lawyer found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { lawyer: updatedLawyer },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a lawyer user and profile (Admin only)
 */
exports.deleteLawyer = async (req, res, next) => {
  try {
    const deleted = await Lawyer.delete(req.params.id);
    if (!deleted) {
      return next(new AppError('No lawyer found with that ID.', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
