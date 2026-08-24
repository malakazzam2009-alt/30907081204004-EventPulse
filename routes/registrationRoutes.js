const express = require('express');

const {
  getMyRegistrations,
  cancelRegistration,
} = require('../controllers/registrationController');

const requireAuth = require('../middleware/requireAuth');

const {
  validate,
  registrationIdRules,
} = require('../middleware/validators');

// Create the registration router.
const router = express.Router();

/**
 * @swagger
 * /api/registrations/my:
 *   get:
 *     summary: Get the authenticated user's registered events
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's registrations with event details
 *       401:
 *         description: Authentication required
 */

// Get the authenticated user's registrations.
router.get(
  '/my',
  requireAuth,
  getMyRegistrations
);

/**
 * @swagger
 * /api/registrations/{id}:
 *   delete:
 *     summary: Cancel the authenticated user's own registration
 *     tags: [Registrations]
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
 *         description: Registration cancelled and place freed
 *       400:
 *         description: Invalid registration ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Cannot cancel another user's registration
 *       404:
 *         description: Registration not found
 */

// Cancel the authenticated user's registration.
router.delete(
  '/:id',
  requireAuth,
  registrationIdRules,
  validate,
  cancelRegistration
);

// Export the registration router.
module.exports = router;