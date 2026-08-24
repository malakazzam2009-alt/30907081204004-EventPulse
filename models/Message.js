const mongoose = require('mongoose');

// Define the Message schema.
const messageSchema = new mongoose.Schema(

  {
    // Link the message to its event.
    event: {

      // Store the event ObjectId.
      type: mongoose.Schema.Types.ObjectId,

      // Reference the Event model.
      ref: 'Event',

      // Require an event ID.
      required: [true, 'Event ID is required'],

    },

    // Link the message to its sender.
    sender: {

      // Store the sender ObjectId.
      type: mongoose.Schema.Types.ObjectId,

      // Reference the User model.
      ref: 'User',

      // Require a sender ID.
      required: [true, 'Sender ID is required'],

    },

    // Store the announcement text.
    text: {

      // Define the field as a string.
      type: String,

      // Require message text.
      required: [true, 'Message text is required'],

      // Remove extra spaces from the text.
      trim: true,

    },

  },

  // Automatically manage createdAt and updatedAt.
  { timestamps: true }

);

// Compound index to speed up history retrieval ordered by time
messageSchema.index({ event: 1, createdAt: 1 });

// Export the Message model.
module.exports = mongoose.model('Message', messageSchema);