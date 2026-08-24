const Event = require('../models/Event');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Admin broadcasts an announcement to one event's room, and it is saved
// @route   POST /api/events/:eventId/announcements
// @access  Private/Admin
exports.createAnnouncement = asyncHandler(async (req, res) => {

  // Get the event ID and announcement text.
  const { eventId } = req.params;
  const { text } = req.body;

  // Check that the event exists.
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found.', 404);

  // Save the announcement in the database.
  const message = await Message.create({
    event: eventId,
    sender: req.user.id,
    text,
  });

  // Get the Socket.io server instance.
  const io = req.app.get('io');

  // Create the room name for the event.
  const roomName = `event:${eventId}`;

  // Broadcast the announcement to all users in the event room.
  if (io) {
    io.to(roomName).emit('announcement', {
      id: message._id,
      event: eventId,
      sender: req.user.id,
      text: message.text,
      createdAt: message.createdAt,
    });
  }

  // Return the saved announcement.
  res.status(201).json({ success: true, data: message });
});

// @desc    Get previous announcements for an event, ordered by time
// @route   GET /api/events/:eventId/announcements
// @access  Private
exports.getAnnouncements = asyncHandler(async (req, res) => {

  // Get the event ID from the request.
  const { eventId } = req.params;

  // Check that the event exists.
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found.', 404);

  // Get all announcements ordered by creation time.
  const messages = await Message.find({ event: eventId })
    .populate('sender', 'name email role')
    .sort('createdAt');

  // Return the announcements with their count.
  res.status(200).json({ success: true, count: messages.length, data: messages });
});