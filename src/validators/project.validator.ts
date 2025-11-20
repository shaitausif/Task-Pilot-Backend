import { body } from 'express-validator'
import { mongoIdPathVariableValidator } from './mongodb.validator.js'

export const createProjectValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('status').optional().isIn(['Active','On Hold','Completed']).withMessage('Invalid status'),

]

export const projectIdParamValidator = (paramName = 'id') => [
  ...mongoIdPathVariableValidator(paramName),

]

export const updateProjectValidator = (paramName = 'id') => [
  ...mongoIdPathVariableValidator(paramName),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('status').optional().isIn(['Active','On Hold','Completed']).withMessage('Invalid status'),

]


