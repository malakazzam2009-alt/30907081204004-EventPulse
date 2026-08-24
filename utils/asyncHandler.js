/**
 * Wraps an asynchronous controller function and forwards
 * any thrown or rejected error to Express error-handling
 * middleware through next(err).
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    // Execute the controller and handle both resolved
    // and rejected promises.
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;