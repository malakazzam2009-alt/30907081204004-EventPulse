const AppError = require('../utils/AppError');

/**
 * 404 handler for unknown routes.
 */
function notFound(req, res, next) {

  // Create a 404 error for unknown routes.
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

/**
 * Central error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {

  // Set the default status code and error message.
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;

    // Collect all validation error messages.
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose CastError (Bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value. This record already exists.';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  // Log error for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);

  // Send the error response to the client.
  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };