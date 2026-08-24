const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    List all categories
// @route   GET /api/categories
// @access  Public
exports.listCategories = asyncHandler(async (req, res) => {

  // Get all categories sorted by name.
  const categories = await Category.find().sort('name');

  // Return the categories with their total count.
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {

  // Create a new category from the request data.
  const category = await Category.create(req.body);

  // Return the created category.
  res.status(201).json({ success: true, data: category });
});

// @desc    Update a category
// @route   PATCH /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {

  // Update the category and return the updated data.
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Return an error if the category does not exist.
  if (!category) throw new AppError('Category not found.', 404);

  // Return the updated category.
  res.status(200).json({ success: true, data: category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {

  // Delete the category by its ID.
  const category = await Category.findByIdAndDelete(req.params.id);

  // Return an error if the category does not exist.
  if (!category) throw new AppError('Category not found.', 404);

  // Confirm that the category was deleted.
  res.status(200).json({ success: true, data: {} });
});