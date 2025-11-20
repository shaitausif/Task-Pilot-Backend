import { body } from 'express-validator'

// Validators for authentication routes
export const registerValidator = [
  body('fullName').notEmpty().withMessage('Full name is required').trim(),
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 6 characters'),
]

export const loginValidator = [
  // require password and at least one of username/email in the route handler
  body('password').notEmpty().withMessage('Password is required'),
  // allow either username or email; check at least one present
  body('username').optional().trim(),
  body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
]

export const refreshTokenValidator = [
  // refresh token may be sent in body; optional because cookie is preferred
  body('refreshToken').optional().notEmpty().withMessage('refreshToken cannot be empty'),
]
