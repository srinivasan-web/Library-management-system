const { body, query } = require('express-validator');
const { BORROW_STATUS } = require('../constants/borrowStatus');
const {
  objectIdParam,
  objectIdQuery,
  paginationValidators,
  isObjectId,
} = require('./commonValidators');

const borrowBookValidators = [
  body('bookId').custom((value) => {
    if (!isObjectId(value)) {
      throw new Error('bookId must be a valid MongoDB ObjectId');
    }

    return true;
  }),
  body('memberId').custom((value) => {
    if (!isObjectId(value)) {
      throw new Error('memberId must be a valid MongoDB ObjectId');
    }

    return true;
  }),
  body('dueDate').isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('notes is too long'),
];

const returnBookValidators = [
  objectIdParam('id'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('notes is too long'),
];

const listBorrowRecordValidators = [
  ...paginationValidators,
  query('status').optional().isIn(Object.values(BORROW_STATUS)).withMessage('status is invalid'),
  objectIdQuery('memberId'),
  objectIdQuery('bookId'),
];

module.exports = {
  borrowBookValidators,
  returnBookValidators,
  listBorrowRecordValidators,
};
