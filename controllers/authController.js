const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (always created as attendee)
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {

  // Get user registration data from the request.
  const { name, email, password } = req.body;

  // Check if an account with the same email already exists.
  const existing = await User.findOne({ email: email.toLowerCase() });

  // Prevent duplicate accounts.
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Create the new user as an attendee.
  const user = await User.create({ name, email, password, role: 'attendee' });

  // Generate a JWT for the new user.
  const token = generateToken(user);

  // Return the created user and authentication token.
  res.status(201).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
});

// @desc    Log in and receive a JWT
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {

  // Get login credentials from the request.
  const { email, password } = req.body;

  // Find the user and include the password for verification.
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Reject the login if the user does not exist.
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Compare the provided password with the stored password.
  const matches = await user.comparePassword(password);

  // Reject the login if the password is incorrect.
  if (!matches) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Generate a JWT for the authenticated user.
  const token = generateToken(user);

  // Return the user and authentication token.
  res.status(200).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {

  // Find the authenticated user by ID.
  const user = await User.findById(req.user.id);

  // Return an error if the user is not found.
  if (!user) throw new AppError('User not found.', 404);

  // Return the authenticated user's information.
  res.status(200).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});