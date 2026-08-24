const AppError = require('../utils/AppError');

/**
 * requireRole(...roles)
 * Reads the role attached by requireAuth and rejects with 403
 * any user whose role is not included in the allowed list.
 * Must be used AFTER requireAuth in the middleware chain.
 */
function requireRole(...roles) {

  // Check the user's role against the allowed roles.
  return (req, res, next) => {

    // Reject the request if the user is not authenticated.
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    // Reject the request if the user's role is not allowed.
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    // Continue to the next middleware.
    next();
  };
}

module.exports = requireRole;