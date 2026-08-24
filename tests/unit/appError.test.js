const AppError = require('../../utils/AppError');

describe('AppError Unit Tests', () => {

  // Verify that AppError correctly sets the error message,
  // status code, and operational flag.
  test('sets message, statusCode, and operational flag correctly', () => {

    const err = new AppError('Not found', 404);

    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);

  });

  // Verify that 4xx errors are classified as client failures.
  test('sets status to "fail" for 4xx status codes', () => {

    const err = new AppError('Bad request', 400);

    expect(err.status).toBe('fail');

  });

  // Verify that 5xx errors are classified as server errors.
  test('sets status to "error" for 5xx status codes', () => {

    const err = new AppError('Server exploded', 500);

    expect(err.status).toBe('error');

  });

  // Verify that the status code defaults to 500
  // when no status code is provided.
  test('defaults to statusCode 500 when no statusCode is provided', () => {

    const err = new AppError('Something went wrong');

    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');

  });

  // Verify that AppError properly inherits from
  // both the native Error class and AppError.
  test('inherits correctly from Error and AppError', () => {

    const err = new AppError('Oops', 400);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);

  });

  // Verify that a stack trace is captured when
  // an AppError instance is created.
  test('captures stack trace upon instantiation', () => {

    const err = new AppError('Stack test', 400);

    expect(err.stack).toBeDefined();

  });

});