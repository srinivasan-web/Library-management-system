const { body, query } = require('express-validator');
const { MEMBER_STATUS } = require('../constants/memberStatus');
const { objectIdParam, paginationValidators } = require('./commonValidators');

const createMemberValidators = [
  body('membershipId').optional().trim().isLength({ min: 3, max: 40 }).withMessage('membershipId is invalid'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 25 }).withMessage('phone is too long'),
  body('address').optional().trim().isLength({ max: 250 }).withMessage('address is too long'),
  body('status').optional().isIn(Object.values(MEMBER_STATUS)).withMessage('status is invalid'),
  body('activeBorrowLimit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('activeBorrowLimit must be between 1 and 20'),
];

const updateMemberValidators = [
  objectIdParam('id'),
  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error('request body must contain at least one field to update');
    }

    return true;
  }),
  body('membershipId').optional().trim().isLength({ min: 3, max: 40 }).withMessage('membershipId is invalid'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('name is invalid'),
  body('email').optional().isEmail().withMessage('email must be valid').normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 25 }).withMessage('phone is too long'),
  body('address').optional().trim().isLength({ max: 250 }).withMessage('address is too long'),
  body('status').optional().isIn(Object.values(MEMBER_STATUS)).withMessage('status is invalid'),
  body('activeBorrowLimit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('activeBorrowLimit must be between 1 and 20'),
];

const listMemberValidators = [
  ...paginationValidators,
  query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('search is invalid'),
  query('status').optional().isIn(Object.values(MEMBER_STATUS)).withMessage('status is invalid'),
];

module.exports = {
  createMemberValidators,
  updateMemberValidators,
  listMemberValidators,
};
