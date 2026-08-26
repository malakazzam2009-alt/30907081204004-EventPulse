const express = require('express');

const {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

const {
  registerForEvent,
} = require('../controllers/registrationController');

const {
  createAnnouncement,
  getAnnouncements,
} = require('../controllers/messageController');

const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const {
  validate,
  rejectUnknownQueryParams,
  eventCreateRules,
  eventUpdateRules,
  eventQueryRules,
  allowedEventQueryParams,
  messageRules,
} = require('../middleware/validators');

// Create the event router.
const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List events
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search events by name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter events by category
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter events by city
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of events per page
 *     responses:
 *       200:
 *         description: List of events
 */
router.get(
  '/',
  rejectUnknownQueryParams(allowedEventQueryParams),
  eventQueryRules,
  validate,
  listEvents
);


/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', getEvent);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event (admin only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  eventCreateRules,
  validate,
  createEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Update an event (admin only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Event not found
 *       422:
 *         description: Validation error
 */
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  eventUpdateRules,
  validate,
  updateEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event (admin only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Event not found
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  deleteEvent
);

/**
 * @swagger
 * /api/events/{eventId}/register:
 *   post:
 *     summary: Register the authenticated user for an event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Event is full or registration is not allowed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Event not found
 */
router.post(
  '/:eventId/register',
  requireAuth,
  registerForEvent
);

/**
 * @swagger
 * /api/events/{eventId}/announcements:
 *   get:
 *     summary: Get previous announcements for an event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of announcements
 *       404:
 *         description: Event not found
 */
router.get(
  '/:eventId/announcements',
  getAnnouncements
);

/**
 * @swagger
 * /api/events/{eventId}/announcements:
 *   post:
 *     summary: Create an announcement for an event (admin only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created successfully
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
  '/:eventId/announcements',
  requireAuth,
  requireRole('admin'),
  messageRules,
  validate,
  createAnnouncement
);

// Export the event router.
module.exports = router;