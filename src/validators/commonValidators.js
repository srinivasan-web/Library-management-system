const mongoose = require('mongoose');
const { param, query } = require('express-validator');

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function objectIdParam(name = 'id') {
  return param(name).custom((value) => {
    if (!isObjectId(value)) {
      throw new Error(`${name} must be a valid MongoDB ObjectId`);
    }

    return true;
  });
}

function objectIdQuery(name) {
  return query(name).optional().custom((value) => {
    if (!isObjectId(value)) {
      throw new Error(`${name} must be a valid MongoDB ObjectId`);
    }

    return true;
  });
}

const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

module.exports = {
  isObjectId,
  objectIdParam,
  objectIdQuery,
  paginationValidators,
};
