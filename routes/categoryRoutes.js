const express = require('express');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const {
  validate,
  categoryRules,
  categoryUpdateRules,
} = require('../middleware/validators');

// Create the category router.
const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       403:
 *         description: Forbidden - admin only
 *       422:
 *         description: Validation error
 */

// Get all categories.
router.get('/', listCategories);

// Create a category for admins.
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  categoryRules,
  validate,
  createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */

// Update a category for admins.
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  categoryUpdateRules,
  validate,
  updateCategory
);

// Delete a category for admins.
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  deleteCategory
);

// Export the category router.
module.exports = router;