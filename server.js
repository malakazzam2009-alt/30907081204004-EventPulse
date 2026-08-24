require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const initSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

/**
 * Starts the EventPulse API server after establishing
 * the database connection and configuring Socket.io.
 */
async function start() {
  try {
    // Connect to MongoDB before starting the server.
    await connectDB();
  } catch (err) {
    // Stop the application if the database connection fails.
    console.error(
      'Failed to connect to the database. Server will not start.',
      err.message
    );
    process.exit(1);
  }

  // Create an HTTP server using the Express application.
  const httpServer = http.createServer(app);

  // Initialize Socket.io with the configured CORS origin.
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || '*' },
  });

  // Make io accessible to controllers via req.app.get('io').
  app.set('io', io);

  // Initialize Socket.io connection and event handlers.
  initSockets(io);

  // Start the server and display useful endpoint information.
  httpServer.listen(PORT, () => {
    console.log(`EventPulse API listening on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    console.log(`Health check at http://localhost:${PORT}/health`);
  });
}

start();