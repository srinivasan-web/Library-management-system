const { body } = require('express-validator');

const registerValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('name must be between 2 and 80 characters'),
  body('email')
    .isEmail()
    .withMessage('email must be valid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('password must be between 8 and 72 characters')
    .matches(/[A-Z]/)
    .withMessage('password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('password must contain at least one number'),
];

const loginValidators = [
  body('email')
    .isEmail()
    .withMessage('email must be valid')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('password is required'),
];

module.exports = {
  registerValidators,
  loginValidators,
};
