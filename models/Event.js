const mongoose = require('mongoose');

// Define the Event schema.
const eventSchema = new mongoose.Schema(

  {
    // Store the event name.
    name: {

      // Define the field as a string.
      type: String,

      // Require an event name.
      required: [true, 'Event name is required'],

      // Remove extra spaces from the name.
      trim: true,

    },

    // Store the event description.
    description: {

      // Define the field as a string.
      type: String,

      // Require an event description.
      required: [true, 'Event description is required'],

      // Remove extra spaces from the description.
      trim: true,

    },

    // Store the event date.
    date: {

      // Define the field as a date.
      type: Date,

      // Require an event date.
      required: [true, 'Event date is required'],

    },

    // Store the event city.
    city: {

      // Define the field as a string.
      type: String,

      // Require a city.
      required: [true, 'City is required'],

      // Remove extra spaces from the city.
      trim: true,

    },

    // Store the event venue.
    venue: {

      // Define the field as a string.
      type: String,

      // Remove extra spaces from the venue.
      trim: true,

    },

    // Store the maximum number of attendees.
    capacity: {

      // Define the field as a number.
      type: Number,

      // Require the event capacity.
      required: [true, 'Capacity is required'],

      // Ensure the capacity is at least one.
      min: [1, 'Capacity must be at least 1'],

    },

    // Track the number of registered attendees.
    registrationsCount: {

      // Define the field as a number.
      type: Number,

      // Start with zero registrations.
      default: 0,

      // Prevent negative registration counts.
      min: [0, 'Registrations count cannot be negative'],

      // Ensure registrations do not exceed capacity.
      validate: {
        validator: function (val) {

          // Check the registration count against the capacity.
          return val <= this.capacity;
        },

        message: 'Registrations count cannot exceed total capacity',
      },

    },

    // Link the event to its category.
    category: {

      // Store the category ObjectId.
      type: mongoose.Schema.Types.ObjectId,

      // Reference the Category model.
      ref: 'Category',

      // Require a category.
      required: [true, 'Category is required'],

    },

    // Link the event to the user who created it.
    createdBy: {

      // Store the creator's ObjectId.
      type: mongoose.Schema.Types.ObjectId,

      // Reference the User model.
      ref: 'User',

      // Require a creator user ID.
      required: [true, 'Creator user ID is required'],

    },

  },

  // Automatically manage createdAt and updatedAt.
  { timestamps: true }

);

// Indexes to support text search and query optimization
eventSchema.index({ name: 'text', description: 'text' });
eventSchema.index({ city: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });

// Virtual property to check if the event reached full capacity
eventSchema.virtual('isFull').get(function isFull() {

  // Return true when registrations reach the capacity.
  return this.registrationsCount >= this.capacity;
});

// Include virtual properties in JSON responses.
eventSchema.set('toJSON', { virtuals: true });

// Include virtual properties in JavaScript objects.
eventSchema.set('toObject', { virtuals: true });

// Export the Event model.
module.exports = mongoose.model('Event', eventSchema);