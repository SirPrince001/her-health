const { body, validationResult } = require('express-validator');

exports.validateRegistrationInputs = () => [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Fullname is required')
    .isString()
    .withMessage('Firstname must be a string'),
  body('lastName').trim().notEmpty().withMessage('Lastname is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('gender').trim().notEmpty().withMessage('Gender is required'),
  body('phone')
    .notEmpty()
    .isMobilePhone()
    .withMessage('Phone number is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ min: 8, max: 255 })
    .isEmail()
    .withMessage('Invalid Email Format'),
];

//validate login input
exports.validateLoginInputs = () => [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email Format'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6})
    .withMessage('Password must be at least 6 characters long'),
];

// middleware to handle validation error
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};
