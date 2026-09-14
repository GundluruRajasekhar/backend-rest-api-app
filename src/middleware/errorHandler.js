const ApiError = require('../utils/ApiError');

/**
 * Converts known error types (Mongoose validation/cast/duplicate-key errors,
 * etc.) into ApiError so every response follows the same JSON shape.
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return ApiError.badRequest('Validation failed', details);
  }

  // Mongoose invalid ObjectId / bad cast
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for field "${err.path}": ${err.value}`);
  }

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for "${field}"`);
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON in request body');
  }

  return ApiError.internal(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  );
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const apiError = normalizeError(err);

  if (!apiError.isOperational || apiError.statusCode >= 500) {
    console.error(err);
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      message: apiError.message,
      ...(apiError.details ? { details: apiError.details } : {}),
    },
  });
}

module.exports = errorHandler;
