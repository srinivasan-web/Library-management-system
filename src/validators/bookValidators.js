const { body, query } = require('express-validator');
const { BOOK_STATUS } = require('../constants/bookStatus');
const { objectIdParam, paginationValidators } = require('./commonValidators');

const currentYear = new Date().getFullYear();

const createBookValidators = [
  body('title').trim().isLength({ min: 1, max: 180 }).withMessage('title is required'),
  body('author').trim().isLength({ min: 1, max: 120 }).withMessage('author is required'),
  body('isbn').trim().isLength({ min: 3, max: 20 }).withMessage('isbn must be between 3 and 20 characters'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('category is required'),
  body('publisher').optional().trim().isLength({ max: 120 }).withMessage('publisher is too long'),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: currentYear + 1 })
    .withMessage('publishedYear must be a realistic year'),
  body('language').optional().trim().isLength({ max: 60 }).withMessage('language is too long'),
  body('shelfLocation').optional().trim().isLength({ max: 60 }).withMessage('shelfLocation is too long'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('description is too long'),
  body('totalCopies').isInt({ min: 0 }).withMessage('totalCopies must be zero or greater'),
  body('availableCopies').optional().isInt({ min: 0 }).withMessage('availableCopies must be zero or greater'),
  body('status').optional().isIn(Object.values(BOOK_STATUS)).withMessage('status is invalid'),
];

const updateBookValidators = [
  objectIdParam('id'),
  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error('request body must contain at least one field to update');
    }

    return true;
  }),
  body('title').optional().trim().isLength({ min: 1, max: 180 }).withMessage('title is invalid'),
  body('author').optional().trim().isLength({ min: 1, max: 120 }).withMessage('author is invalid'),
  body('isbn').optional().trim().isLength({ min: 3, max: 20 }).withMessage('isbn is invalid'),
  body('category').optional().trim().isLength({ min: 1, max: 80 }).withMessage('category is invalid'),
  body('publisher').optional().trim().isLength({ max: 120 }).withMessage('publisher is too long'),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: currentYear + 1 })
    .withMessage('publishedYear must be a realistic year'),
  body('language').optional().trim().isLength({ max: 60 }).withMessage('language is too long'),
  body('shelfLocation').optional().trim().isLength({ max: 60 }).withMessage('shelfLocation is too long'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('description is too long'),
  body('totalCopies').optional().isInt({ min: 0 }).withMessage('totalCopies must be zero or greater'),
  body('availableCopies').optional().isInt({ min: 0 }).withMessage('availableCopies must be zero or greater'),
  body('status').optional().isIn(Object.values(BOOK_STATUS)).withMessage('status is invalid'),
];

const listBookValidators = [
  ...paginationValidators,
  query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('search is invalid'),
  query('category').optional().trim().isLength({ min: 1, max: 80 }).withMessage('category is invalid'),
  query('status').optional().isIn(Object.values(BOOK_STATUS)).withMessage('status is invalid'),
];

module.exports = {
  createBookValidators,
  updateBookValidators,
  listBookValidators,
};
