import { body, query } from 'express-validator'
import { mongoIdPathVariableValidator } from './mongodb.validator.js'

export const createNoteValidator = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('content').notEmpty().withMessage('Content is required').trim(),
  body('tag').optional().isIn(['Work','Personal']).withMessage('Invalid tag'),
]



export const searchNotesValidator = [
  query('q').optional().trim(),
  query('tag').optional().isIn(['Work','Personal']).withMessage('Invalid tag'),
]
