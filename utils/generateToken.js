const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing the user's id and role.
 *
 * The token expiration time is taken from JWT_EXPIRES_IN
 * or defaults to 7 days when the environment variable is not set.
 */
function generateToken(user) {
  // Read the JWT secret from environment variables.
  const secret = process.env.JWT_SECRET;

  // Stop token generation if the JWT secret is not configured.
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  // Sign the token using the user's id and role.
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = generateToken;