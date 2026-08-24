const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * requireAuth
 * Verifies the Bearer JWT, attaches the authenticated user to req.user,
 * and rejects missing, expired, or tampered tokens with 401.
 */
const requireAuth = asyncHandler(async (req, res, next) => {

  // Get the Bearer token from the authorization header.
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.split(' ')[1]
    : null;

  // Reject requests without a token.
  if (!token) {
    throw new AppError('Authentication required. No token provided.', 401);
  }

  // Get the JWT secret from the environment variables.
  const secret = process.env.JWT_SECRET;

  // Check that the JWT secret is configured.
  if (!secret) {
    throw new AppError('JWT secret is not configured.', 500);
  }

  let decoded;

  // Verify the token and decode its payload.
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    throw new AppError('Invalid or expired token.', 401);
  }

  // Get the user ID from the token.
  const userId = decoded.id || decoded._id;

  // Find the user associated with the token.
  const user = await User.findById(userId);

  // Reject the token if the user no longer exists.
  if (!user) {
    throw new AppError(
      'User belonging to this token no longer exists.',
      401
    );
  }

  // Attach the authenticated user's data to the request.
  req.user = {
    _id: user._id,
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    name: user.name,
  };

  // Continue to the next middleware.
  next();
});

module.exports = requireAuth;