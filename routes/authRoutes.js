const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { validate, registerRules, loginRules } = require('../middleware/validators');

// Create the authentication router.
const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new attendee account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 */

// Register a new attendee account.
router.post('/register', registerRules, validate, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation error
 */

// Log in and return a JWT.
router.post('/login', loginRules, validate, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */

// Get the authenticated user's profile.
router.get('/me', requireAuth, getMe);

// Export the authentication router.
module.exports = router;