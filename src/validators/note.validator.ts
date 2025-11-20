import { body, query } from 'express-validator'
import { mongoIdPathVariableValidator } from './mongodb.validator.js'

export const createNoteValidator = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('content').notEmpty().withMessage('Content is required').trim(),
  body('tags').optional().isIn(['Work','Personal']).withMessage('Invalid tag'),
]

export const noteIdParamValidator = (paramName = 'id') => [
  ...mongoIdPathVariableValidator(paramName),
]

export const updateNoteValidator = (paramName = 'id') => [
  body('title').optional().trim(),
  body('content').optional().trim(),
  body('tags').optional().isIn(['Work','Personal']).withMessage('Invalid tag'),

]

export const searchNotesValidator = [
  query('q').optional().trim(),
  query('tags').optional().isIn(['Work','Personal']).withMessage('Invalid tag'),
]
