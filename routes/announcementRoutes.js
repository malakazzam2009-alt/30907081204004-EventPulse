const express = require('express');

const {
  createAnnouncementFlat,
  getAnnouncements,
} = require('../controllers/messageController');

const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const {
  validate,
  announcementCreateRules,
} = require('../middleware/validators');

// Create the announcement router.
// Mounted at /api/announcements.
const router = express.Router();

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Create and broadcast an announcement for an event (admin only)
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - text
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event
 *               text:
 *                 type: string
 *                 description: Announcement text
 *     responses:
 *       201:
 *         description: Announcement created and broadcast successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Event not found
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  announcementCreateRules,
  validate,
  createAnnouncementFlat
);

/**
 * @swagger
 * /api/announcements:
 *   get:
 *     summary: Get all announcements from all events
 *     tags:
 *       - Announcements
 *     responses:
 *       200:
 *         description: List of all announcements
 */
router.get('/', getAnnouncements);

// Export the announcement router.
module.exports = router;