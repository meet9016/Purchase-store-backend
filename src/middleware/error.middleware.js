const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  console.error(`❌ [API Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier: ${err.value}`;
    return ApiResponse.badRequest(res, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return ApiResponse.badRequest(res, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return ApiResponse.badRequest(res, 'Validation Error', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid authorization token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Authorization token expired');
  }

  // Default server error
  return ApiResponse.error(
    res,
    error.message || 'Internal Server Error',
    err.statusCode || 500
  );
};

// 404 Route Not Found Handler
const notFound = (req, res, next) => {
  return ApiResponse.notFound(res, `Route not found: ${req.method} ${req.originalUrl}`);
};

module.exports = { errorHandler, notFound };
