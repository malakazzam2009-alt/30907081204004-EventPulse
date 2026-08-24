const mongoose = require('mongoose');

// Category schema definition

const categorySchema = new mongoose.Schema(

  {
    // Store the category name.
    name: {

      // Define the field as a string.
      type: String,

      // Require a category name.
      required: [true, 'Category name is required'],

      // Prevent duplicate category names.
      unique: true,

      // Remove extra spaces from the name.
      trim: true,

    },

    // Store an optional category description.
    description: {

      // Define the field as a string.
      type: String,

      // Remove extra spaces from the description.
      trim: true,

      // Use an empty string when no description is provided.
      default: '',

    },

  },

  { timestamps: true } // Automatically manages createdAt and updatedAt

);

// Export the Category model.
module.exports = mongoose.model('Category', categorySchema);