const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error stack trace for debugging
  console.error('Error occurred:', {
    message: err.message,
    status: err.status,
    statusCode: err.statusCode,
    stack: err.stack
  });

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // Production response
  if (err.isOperational) {
    // Trusted operational error: send clear message to client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming/system errors: don't leak details
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected internal server error occurred.'
  });
};

module.exports = errorHandler;
