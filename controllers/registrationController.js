const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register the authenticated user for an event
// @route   POST /api/events/:eventId/register
// @access  Private
exports.registerForEvent = asyncHandler(async (req, res) => {

  // Get the current user and event IDs.
  const userId = req.user._id || req.user.id;
  const eventId = req.params.eventId;

  // Check that the event exists
  const event = await Event.findById(eventId);

  // Return an error if the event does not exist.
  if (!event) {
    throw new AppError('Event not found.', 404);
  }

  // Prevent duplicate registration
  const existing = await Registration.findOne({
    event: eventId,
    user: userId,
  });

  // Return an error if the user is already registered.
  if (existing) {
    throw new AppError(
      'You are already registered for this event.',
      409
    );
  }

  /*
   * Atomically reserve a place only if the event
   * has not reached its capacity.
   */
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      $expr: {
        $lt: ['$registrationsCount', '$capacity'],
      },
    },
    {
      $inc: { registrationsCount: 1 },
    },
    {
      new: true,
    }
  );

  // Return an error if the event has reached its capacity.
  if (!updatedEvent) {
    throw new AppError('This event is full.', 400);
  }

  try {
    // Create the user's event registration.
    const registration = await Registration.create({
      event: eventId,
      user: userId,
    });

    // Return the created registration.
    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    /*
     * If registration creation fails, release the reserved
     * event capacity.
     */
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registrationsCount: -1 },
    });

    // Handle duplicate registration caused by a race condition.
    if (error.code === 11000) {
      throw new AppError(
        'You are already registered for this event.',
        409
      );
    }

    // Pass other errors to the error handler.
    throw error;
  }
});

// @desc    Get the authenticated user's registrations
// @route   GET /api/registrations/my
// @access  Private
exports.getMyRegistrations = asyncHandler(async (req, res) => {

  // Get the current user's ID.
  const userId = req.user._id || req.user.id;

  // Get all registrations for the current user.
  const registrations = await Registration.find({
    user: userId,
  })
    .populate('event')
    .sort({ createdAt: -1 });

  // Return the user's registrations with their count.
  res.status(200).json({
    success: true,
    count: registrations.length,
    data: registrations,
  });
});

// @desc    Cancel the authenticated user's own registration
// @route   DELETE /api/registrations/:id
// @access  Private
exports.cancelRegistration = asyncHandler(async (req, res) => {

  // Get the current user and registration IDs.
  const userId = req.user._id || req.user.id;
  const registrationId = req.params.id;

  // Find the registration
  const registration = await Registration.findById(registrationId);

  // Return an error if the registration does not exist.
  if (!registration) {
    throw new AppError('Registration not found.', 404);
  }

  // Make sure the registration belongs to the current user
  if (registration.user.toString() !== userId.toString()) {
    throw new AppError(
      'You can only cancel your own registration.',
      403
    );
  }

  // Delete the registration
  await registration.deleteOne();

  // Free one place in the event
  await Event.findByIdAndUpdate(registration.event, {
    $inc: { registrationsCount: -1 },
  });

  // Confirm that the registration was cancelled.
  res.status(200).json({
    success: true,
    message: 'Registration cancelled successfully.',
  });
});