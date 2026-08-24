const mongoose = require('mongoose');

// Define the Registration schema.
const registrationSchema = new mongoose.Schema(

  {
    // Link the registration to the user.
    user: {

      // Store the user ObjectId.
      type: mongoose.Schema.Types.ObjectId,

      // Reference the User model.
      ref: 'User',

      // Require a user ID.
      required: [true, 'User ID is required'],

    },

    // Link the registration to the event.
    event: {

      // Store the event ObjectId.
      type: mongoose.Schema.Types.ObjectId,

      // Reference the Event model.
      ref: 'Event',

      // Require an event ID.
      required: [true, 'Event ID is required'],

    },

  },

  // Automatically manage createdAt and updatedAt.
  { timestamps: true }

);

// Unique compound index
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Export the Registration model.
module.exports = mongoose.model('Registration', registrationSchema);