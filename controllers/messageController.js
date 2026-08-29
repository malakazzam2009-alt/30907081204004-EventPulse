const Event = require('../models/Event');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Shared core logic: create the announcement, persist it,
// and broadcast it over Socket.io to the event's room.
async function createAnnouncementCore(req, res, eventId, text) {
  // Check that the event exists.
  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError('Event not found.', 404);
  }

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
  res.status(201).json({
    success: true,
    data: message,
  });
}

// @desc    Admin broadcasts an announcement to one event's room
// @route   POST /api/events/:eventId/announcements
// @access  Private/Admin
exports.createAnnouncement = asyncHandler(async (req, res) => {
  // Get the event ID from the URL.
  const { eventId } = req.params;

  // Get the announcement text from the body.
  const { text } = req.body;

  await createAnnouncementCore(req, res, eventId, text);
});

// @desc    Admin broadcasts an announcement to one event's room
// @route   POST /api/announcements
// @access  Private/Admin
exports.createAnnouncementFlat = asyncHandler(async (req, res) => {
  // Get the event ID and announcement text from the body.
  const { eventId, text } = req.body;

  await createAnnouncementCore(req, res, eventId, text);
});

// @desc    Get all announcements from all events
// @route   GET /api/announcements
// @access  Public
exports.getAnnouncements = asyncHandler(async (req, res) => {
  // Get all announcements.
  const messages = await Message.find()
    .populate('event', 'name date city venue')
    .populate('sender', 'name email role')
    .sort('createdAt');

  // Return all announcements with their count.
  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});