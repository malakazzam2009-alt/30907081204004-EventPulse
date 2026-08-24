/**
 * Custom application error class.
 *
 * Creates an operational error with a specific HTTP status code
 * and a safe message that can be returned to the client.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    // Call the parent Error constructor with the provided message.
    super(message);

    // Use the provided status code or default to 500.
    this.statusCode = statusCode || 500;

    // Classify 4xx errors as "fail" and 5xx errors as "error".
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Mark this error as an expected operational error.
    this.isOperational = true;

    // Capture the stack trace starting from this AppError instance.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;