const { ApiError } = require('../utils/ApiError');
const { config } = require('../config/env');

function mapMongoDuplicateError(error) {
  const fields = Object.keys(error.keyValue || {});
  const fieldText = fields.length ? fields.join(', ') : 'field';
  return new ApiError(409, `${fieldText} already exists`, 'DUPLICATE_RESOURCE', error.keyValue);
}

function mapMongooseValidationError(error) {
  const details = Object.values(error.errors || {}).map((item) => ({
    field: item.path,
    message: item.message,
  }));

  return new ApiError(400, 'Database validation failed', 'DATABASE_VALIDATION_ERROR', details);
}

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.name === 'ValidationError') {
    return mapMongooseValidationError(error);
  }

  if (error.name === 'CastError') {
    return new ApiError(400, `Invalid ${error.path}`, 'INVALID_ID');
  }

  if (error.code === 11000) {
    return mapMongoDuplicateError(error);
  }

  if (error.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid authentication token', 'AUTH_TOKEN_INVALID');
  }

  if (error.name === 'TokenExpiredError') {
    return new ApiError(401, 'Authentication token has expired', 'AUTH_TOKEN_EXPIRED');
  }

  return new ApiError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
}

function errorHandler(error, req, res, next) {
  const normalizedError = normalizeError(error);

  if (!normalizedError.isOperational || normalizedError.statusCode >= 500) {
    console.error(error);
  }

  const response = {
    status: 'error',
    message: normalizedError.message,
    code: normalizedError.code,
  };

  if (normalizedError.details) {
    response.details = normalizedError.details;
  }

  if (!config.isProduction) {
    response.stack = error.stack;
  }

  res.status(normalizedError.statusCode).json(response);
}

module.exports = {
  errorHandler,
};
