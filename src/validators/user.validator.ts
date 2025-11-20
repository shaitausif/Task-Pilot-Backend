import { body } from 'express-validator'


export const roleValidator = [
    body('role').notEmpty().isIn(['Admin','User'])
]


export const changePasswordValidator = [
  // require password and at least one of username/email in the route handler
  body('oldPassword').notEmpty().isLength({ min : 8 }).withMessage('Old Password is required'),
  body("newPassword").notEmpty().isLength({ min : 8 }).withMessage("New Password is required")

]

export const profileValidator = [
  
    body("fullName").optional().isLength({ max : 20 }).withMessage("Full Name is required"),
    body("username").optional().isLength({ max : 10}).withMessage("Username is required"),
    body("email").optional().isEmail().isLength({ max : 20 }).withMessage("Email-ID is required"),
    body("bio").optional().isLength({ max : 100 }).withMessage("Bio is required")
]
    