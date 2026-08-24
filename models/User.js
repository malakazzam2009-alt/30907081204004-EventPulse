const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema.
const userSchema = new mongoose.Schema(

  {
    // Store the user's name.
    name: {

      // Define the field as a string.
      type: String,

      // Require a user name.
      required: [true, 'Name is required'],

      // Remove extra spaces from the name.
      trim: true,

    },

    // Store the user's email.
    email: {

      // Define the field as a string.
      type: String,

      // Require an email address.
      required: [true, 'Email is required'],

      // Prevent duplicate email addresses.
      unique: true,

      // Convert the email to lowercase.
      lowercase: true,

      // Remove extra spaces from the email.
      trim: true,

    },

    // Store the user's password securely.
    password: {

      // Define the field as a string.
      type: String,

      // Require a password.
      required: [true, 'Password is required'],

      // Set the minimum password length.
      minlength: [6, 'Password must be at least 6 characters'],

      // Hide the password from query results by default.
      select: false,

    },

    // Store the user's role.
    role: {

      // Define the field as a string.
      type: String,

      // Allow only admin or attendee roles.
      enum: {

        values: ['admin', 'attendee'],

        message: '{VALUE} is not a valid role',
      },

      // Set attendee as the default role.
      default: 'attendee',

    },

  },

  // Automatically manage createdAt and updatedAt.
  { timestamps: true }

);

// Hash the password before saving if modified
userSchema.pre('save', async function hashPassword(next) {

  // Skip hashing if the password was not changed.
  if (!this.isModified('password')) return next();

  try {

    // Generate a salt for password hashing.
    const salt = await bcrypt.genSalt(10);

    // Hash the user's password.
    this.password = await bcrypt.hash(this.password, salt);

    // Continue saving the user.
    next();

  } catch (err) {

    // Pass hashing errors to the error handler.
    next(err);
  }
});

// Compare entered password with stored hashed password
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {

  // Compare the entered password with the stored hash.
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model.
module.exports = mongoose.model('User', userSchema);