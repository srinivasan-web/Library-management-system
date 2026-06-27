const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/ApiError');

function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
    value: error.value,
  }));

  return next(new ApiError(400, 'Request validation failed', 'VALIDATION_ERROR', details));
}

module.exports = {
  validateRequest,
};
