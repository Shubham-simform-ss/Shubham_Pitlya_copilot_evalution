import Joi from 'joi';
import { TaskStatus, TaskPriority } from '../models/task.model';

/**
 * Custom validation for due date - must be in the future
 */
const futureDateValidation = (value: Date, helpers: Joi.CustomHelpers) => {
  const now = new Date();
  if (value < now) {
    return helpers.error('date.future');
  }
  return value;
};

export const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .pattern(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must not exceed 200 characters',
      'string.pattern.base': 'Title contains invalid characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description must not exceed 1000 characters',
      'any.required': 'Description is required'
    }),

  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(TaskStatus).join(', ')}`
    }),

  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .optional()
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`
    }),

  dueDate: Joi.date()
    .iso()
    .custom(futureDateValidation)
    .optional()
    .messages({
      'date.format': 'Due date must be a valid ISO 8601 date string',
      'date.future': 'Due date must be in the future'
    })
});

export const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .pattern(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .optional()
    .messages({
      'string.empty': 'Title must not be empty',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must not exceed 200 characters',
      'string.pattern.base': 'Title contains invalid characters'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .optional()
    .messages({
      'string.empty': 'Description must not be empty',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description must not exceed 1000 characters'
    }),

  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(TaskStatus).join(', ')}`
    }),

  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .optional()
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`
    }),

  dueDate: Joi.date()
    .iso()
    .custom(futureDateValidation)
    .optional()
    .allow(null)
    .messages({
      'date.format': 'Due date must be a valid ISO 8601 date string',
      'date.future': 'Due date must be in the future'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const taskIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid task ID format (must be a valid UUID)',
      'any.required': 'Task ID is required'
    })
});

export const queryFiltersSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(TaskStatus).join(', ')}`
    }),

  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .optional()
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`
    }),

  highPriorityDueSoon: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'highPriorityDueSoon must be a boolean (true/false)'
    }),

  sortBy: Joi.string()
    .valid('createdAt', 'dueDate', 'priority', 'title')
    .optional()
    .messages({
      'any.only': 'sortBy must be one of: createdAt, dueDate, priority, title'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('asc')
    .messages({
      'any.only': 'sortOrder must be either asc or desc'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    })
});
