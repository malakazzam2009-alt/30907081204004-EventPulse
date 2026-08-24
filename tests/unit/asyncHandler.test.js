const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler Unit Tests', () => {

  // Verify that asyncHandler returns a middleware function.
  test('returns a middleware function', () => {
    const fn = jest.fn();
    const handler = asyncHandler(fn);

    expect(typeof handler).toBe('function');
  });

  // Verify that the wrapped asynchronous function receives
  // req, res, and next and executes successfully.
  test('calls the wrapped function with req, res, next on success', async () => {
    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();

    const handler = asyncHandler(async (rq, rs) => {
      rs.json({ ok: true });
    });

    await handler(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  // Verify that asyncHandler catches a thrown error
  // and passes it to the Express next() middleware.
  test('forwards a thrown error to next() instead of throwing', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const testError = new Error('boom');

    const handler = asyncHandler(async () => {
      throw testError;
    });

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(testError);
  });

  // Verify that asyncHandler catches a rejected promise
  // and forwards the rejection error to next().
  test('forwards a rejected promise to next()', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const testError = new Error('rejected');

    const handler = asyncHandler(() => Promise.reject(testError));

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(testError);
  });

});