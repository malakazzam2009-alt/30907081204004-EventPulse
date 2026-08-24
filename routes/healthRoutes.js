const express = require('express');
const { connectDB, getDBState } = require('../config/db');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check the server status and MongoDB connection state.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is running and returns runtime metadata.
 */
router.get('/', async (req, res, next) => {
  try {
    await connectDB();

    res.status(200).json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: getDBState(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;