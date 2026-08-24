const Event = require('../models/Event'); 
const AppError = require('../utils/AppError'); 
const asyncHandler = require('../utils/asyncHandler'); 
 
// @desc    Create an event 
// @route   POST /api/events 
// @access  Private/Admin 
exports.createEvent = asyncHandler(async (req, res) => { 

  // Get event data from the request.
  const { 
    name, 
    title, 
    description, 
    date, 
    venue, 
    city, 
    capacity, 
    category, 
  } = req.body; 
 
  // Create the event and link it to the current admin.
  const event = await Event.create({ 
    name: name || title, 
    description, 
    date, 
    venue, 
    city, 
    capacity, 
    category, 
    createdBy: req.user.id || req.user._id, 
  }); 
 
  // Populate category and creator information.
  const populated = await event.populate([ 
    { 
      path: 'category', 
      select: 'name description', 
    }, 
    { 
      path: 'createdBy', 
      select: 'name email', 
    }, 
  ]); 
 
  // Return the created event.
  res.status(201).json({ 
    status: 'success', 
    data: populated, 
  }); 
}); 
 
// @desc    List events with filtering, pagination, sorting and search 
// @route   GET /api/events 
// @access  Public 
exports.getEvents = asyncHandler(async (req, res) => { 

  // Get filtering, pagination, sorting and search options.
  const { 
    category, 
    city, 
    startDate, 
    endDate, 
    page: pageQuery, 
    limit: limitQuery, 
    sortBy, 
    order, 
    search, 
  } = req.query; 
 
  // Build the event filter.
  const filter = {}; 
 
  // 1. Filter by category 
  if (category) { 
    filter.category = category; 
  } 
 
  // 2. Filter by city 
  if (city) { 
    filter.city = new RegExp(`^${city}$`, 'i'); 
  } 
 
  // 3. Filter by date range 
  if (startDate || endDate) { 
    filter.date = {}; 
 
    if (startDate) { 
      filter.date.$gte = new Date(startDate); 
    } 
 
    if (endDate) { 
      filter.date.$lte = new Date(endDate); 
    } 
  } 
 
  // 4. Search by name or description 
  if (search) { 
    filter.$or = [ 
      { 
        name: { 
          $regex: search, 
          $options: 'i', 
        }, 
      }, 
      { 
        description: { 
          $regex: search, 
          $options: 'i', 
        }, 
      }, 
    ]; 
  } 
 
  // 5. Pagination 
  const page = Math.max( 
    parseInt(pageQuery, 10) || 1, 
    1 
  ); 
 
  const limit = Math.max( 
    parseInt(limitQuery, 10) || 10, 
    1 
  ); 
 
  const skip = (page - 1) * limit; 
 
  // 6. Safe sorting 
  const sortFieldMap = { 
    date: 'date', 
    registrations: 'registrationsCount', 
  }; 
 
  const sortField = sortFieldMap[sortBy] || 'date'; 
 
  const sortDirection = order === 'desc' ? -1 : 1; 
 
  const sortOption = { 
    [sortField]: sortDirection, 
  }; 
 
  // 7. Get events and total count 
  const [events, total] = await Promise.all([ 
    Event.find(filter) 
      .populate('category', 'name description') 
      .populate('createdBy', 'name email') 
      .sort(sortOption) 
      .skip(skip) 
      .limit(limit), 
 
    Event.countDocuments(filter), 
  ]); 
 
  // 8. Response 
  res.status(200).json({ 
    status: 'success', 
    total, 
    page, 
    limit, 
    totalPages: Math.ceil(total / limit), 
    data: events, 
  }); 
}); 
 
// Alias for compatibility 
exports.listEvents = exports.getEvents; 
 
// @desc    Get a single event 
// @route   GET /api/events/:id 
// @access  Public 
exports.getEventById = asyncHandler(async (req, res) => { 

  // Find the event by ID with related data.
  const event = await Event.findById(req.params.id) 
    .populate('category', 'name description') 
    .populate('createdBy', 'name email'); 
 
  // Return an error if the event is not found.
  if (!event) { 
    throw new AppError('Event not found.', 404); 
  } 
 
  // Return the requested event.
  res.status(200).json({ 
    status: 'success', 
    data: event, 
  }); 
}); 
 
// Alias for compatibility 
exports.getEvent = exports.getEventById; 
 
// @desc    Update an event 
// @route   PATCH /api/events/:id 
// @access  Private/Admin 
exports.updateEvent = asyncHandler(async (req, res) => { 

  // Update the event and return the updated data.
  const event = await Event.findByIdAndUpdate( 
    req.params.id, 
    req.body, 
    { 
      new: true, 
      runValidators: true, 
    } 
  ) 
    .populate('category', 'name description') 
    .populate('createdBy', 'name email'); 
 
  // Return an error if the event is not found.
  if (!event) { 
    throw new AppError('Event not found.', 404); 
  } 
 
  // Return the updated event.
  res.status(200).json({ 
    status: 'success', 
    data: event, 
  }); 
}); 
 
// @desc    Delete an event 
// @route   DELETE /api/events/:id 
// @access  Private/Admin 
exports.deleteEvent = asyncHandler(async (req, res) => { 

  // Delete the event by its ID.
  const event = await Event.findByIdAndDelete(req.params.id); 
 
  // Return an error if the event is not found.
  if (!event) { 
    throw new AppError('Event not found.', 404); 
  } 
 
  // Confirm that the event was deleted.
  res.status(200).json({ 
    status: 'success', 
    data: null, 
  }); 
});