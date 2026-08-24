const jwt = require('jsonwebtoken');

/**
 * Wires up Socket.io on the given server instance.
 *
 * Events:
 *  - 'joinEvent'  { eventId }         -> socket joins room `event:<eventId>`
 *  - 'leaveEvent' { eventId }         -> socket leaves room `event:<eventId>`
 *
 * Broadcasting is done from the REST controller (messageController.createAnnouncement)
 * via `io.to('event:<eventId>').emit('announcement', payload)` so that every
 * announcement is both delivered live AND persisted to MongoDB.
 */
function initSockets(io) {

  // Handle optional authentication for Socket.io connections.
  io.use((socket, next) => {

    // Get the optional JWT from the socket connection.
    // It can identify the admin broadcaster, but is not required for listeners.
    const token = socket.handshake.auth?.token;

    if (token) {
      try {

        // Verify the JWT and store the decoded user data.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;

      } catch (err) {

        // Allow the connection as an anonymous listener if the token is invalid.
        socket.user = null;
      }
    }

    // Continue with the Socket.io connection.
    next();
  });

  // Handle new Socket.io connections.
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join the room for a specific event.
    socket.on('joinEvent', ({ eventId }) => {

      // Ignore the request if no event ID is provided.
      if (!eventId) return;

      // Create the event room name.
      const room = `event:${eventId}`;

      // Add the socket to the event room.
      socket.join(room);

      // Confirm that the socket joined the room.
      socket.emit('joinedEvent', { eventId, room });
    });

    // Leave the room for a specific event.
    socket.on('leaveEvent', ({ eventId }) => {

      // Ignore the request if no event ID is provided.
      if (!eventId) return;

      // Create the event room name.
      const room = `event:${eventId}`;

      // Remove the socket from the event room.
      socket.leave(room);

      // Confirm that the socket left the room.
      socket.emit('leftEvent', { eventId, room });
    });

    // Handle client disconnection.
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });
  });
}

// Export the Socket.io initialization function.
module.exports = initSockets;