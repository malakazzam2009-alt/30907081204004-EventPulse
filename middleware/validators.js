const {
  body,
  param,
  query,
  validationResult,
} = require('express-validator');

/**
 * Runs after any express-validator chain.
 * Returns a structured 422 response
 * listing every invalid field,
 * or calls next() when the request is valid.
 */
function validate(req, res, next) {

  // Get validation errors from the request.
  const errors = validationResult(req);

  // Continue if there are no validation errors.
  if (errors.isEmpty()) {
    return next();
  }

  // Return all validation errors to the client.
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

/**
 * Reject unknown query parameters.
 *
 * Only parameters listed in allowedParams are accepted.
 */
function rejectUnknownQueryParams(allowedParams) {

  // Check that all query parameters are allowed.
  return (req, res, next) => {
    const unknownParams = Object.keys(req.query).filter(
      (paramName) => !allowedParams.includes(paramName)
    );

    // Return an error for unknown parameters.
    if (unknownParams.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Unknown query parameter(s)',
        errors: unknownParams.map((paramName) => ({
          field: paramName,
          message: `Unknown query parameter: ${paramName}`,
        })),
      });
    }

    // Continue when all parameters are allowed.
    next();
  };
}

/* =========================
   AUTH VALIDATION
========================= */

// Validate user registration data.
const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .withMessage('A valid email is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validate user login data.
const loginRules = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/* =========================
   EVENT CREATE
========================= */

// Validate event creation data.
const eventCreateRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Event name is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('date')
    .isISO8601()
    .toDate()
    .withMessage('A valid ISO date is required'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),

  body('category')
    .isMongoId()
    .withMessage('A valid category id is required'),
];

/* =========================
   EVENT UPDATE
========================= */

// Validate event update data.
const eventUpdateRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event id format'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event name cannot be empty'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),

  body('date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('A valid ISO date is required'),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),

  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('A valid category id is required'),
];

/* =========================
   EVENT QUERY VALIDATION
========================= */

// Validate event filtering and search parameters.
const eventQueryRules = [
  query('category')
    .optional()
    .isMongoId()
    .withMessage('category must be a valid MongoDB ObjectId'),

  query('city')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('city must be a non-empty string'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('limit must be a positive integer'),

  query('sortBy')
    .optional()
    .isIn(['date', 'registrations'])
    .withMessage('sortBy must be date or registrations'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),

  query('search')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('search must be a non-empty string'),
];

/**
 * All query parameters allowed for GET /api/events
 */

// Define the allowed event query parameters.
const allowedEventQueryParams = [
  'category',
  'city',
  'startDate',
  'endDate',
  'page',
  'limit',
  'sortBy',
  'order',
  'search',
];

/* =========================
   REGISTRATION
========================= */

/**
 * Validation for POST /api/events/:eventId/register
 */

// Validate the event ID for registration.
const registrationRules = [
  param('eventId')
    .isMongoId()
    .withMessage('A valid event id is required'),
];

/**
 * Validation for DELETE /api/registrations/:id
 */

// Validate the registration ID for deletion.
const registrationIdRules = [
  param('id')
    .isMongoId()
    .withMessage('A valid registration id is required'),
];

/* =========================
   CATEGORY
========================= */

// Validate category creation data.
const categoryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
];

// Validate category update data.
const categoryUpdateRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category id format'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty'),
];

/* =========================
   MESSAGE
========================= */

// Validate announcement message data (used on the nested route,
// where eventId already comes from the URL param).
const messageRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Message text is required'),
];

// Validate announcement message data on the flat route
// POST /api/announcements, where eventId is sent in the body.
const announcementCreateRules = [
  body('eventId')
    .notEmpty()
    .withMessage('eventId is required')
    .isMongoId()
    .withMessage('Invalid eventId format'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Message text is required'),
];

/* =========================
   EXPORTS
========================= */

// Export all validation rules and middleware.
module.exports = {
  validate,
  rejectUnknownQueryParams,

  registerRules,
  loginRules,

  eventCreateRules,
  eventUpdateRules,
  eventQueryRules,
  allowedEventQueryParams,

  registrationRules,
  registrationIdRules,

  categoryRules,
  categoryUpdateRules,

  messageRules,
  announcementCreateRules,
};