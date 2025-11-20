import { body, query } from 'express-validator'



export const createTaskValidator = [
  // Controller requires title and description to be present; keep validation minimal and consistent
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('status').optional().isIn(['Pending', 'In-Progress', 'Completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid dueDate'),
];




export const updateTaskValidator = () => [
  // Allow partial updates; only validate known fields
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('status').optional().isIn(['Pending', 'In-Progress', 'Completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid dueDate'),
];

export const searchTasksValidator = [
  query('q').optional().trim(),
  query('status').optional().isIn(['Pending', 'In-Progress', 'Completed']).withMessage('Invalid status'),
  query('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  query('dueFrom').optional().isISO8601().withMessage('Invalid dueFrom date'),
  query('dueTo').optional().isISO8601().withMessage('Invalid dueTo date'),
];
