const Client = require('../models/clientModel');
const AppError = require('../utils/appError');

/**
 * Get all clients, optionally filtered by global search query
 */
exports.getClients = async (req, res, next) => {
  try {
    const searchQuery = req.query.q || '';
    const clients = await Client.findAll(searchQuery);

    res.status(200).json({
      status: 'success',
      results: clients.length,
      data: { clients },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get details for a specific client
 */
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return next(new AppError('No client found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { client },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new client record
 */
exports.createClient = async (req, res, next) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    // Validation
    if (!name || !phone || !email) {
      return next(new AppError('Please provide all required fields: name, phone, email.', 400));
    }

    // Check duplicate email
    const existingClient = await Client.findByEmail(email);
    if (existingClient) {
      return next(new AppError('A client with this email address already exists.', 400));
    }

    const client = await Client.create({
      name,
      phone,
      email,
      address,
      notes,
    });

    res.status(201).json({
      status: 'success',
      data: { client },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing client's details
 */
exports.updateClient = async (req, res, next) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    const clientId = req.params.id;

    // Check email uniqueness if email is changed
    if (email) {
      const existingClient = await Client.findByEmail(email);
      if (existingClient && existingClient.id !== clientId) {
        return next(new AppError('Another client with this email address already exists.', 400));
      }
    }

    const client = await Client.update(clientId, {
      name,
      phone,
      email,
      address,
      notes,
    });

    if (!client) {
      return next(new AppError('No client found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { client },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a client (Restricted to Admin role only via middleware check)
 */
exports.deleteClient = async (req, res, next) => {
  try {
    const deleted = await Client.delete(req.params.id);
    if (!deleted) {
      return next(new AppError('No client found with that ID.', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
