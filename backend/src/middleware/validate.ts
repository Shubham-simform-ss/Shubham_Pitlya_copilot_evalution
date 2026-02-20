import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

/**
 * Sanitize string by removing potentially dangerous characters
 */
const sanitizeString = (value: any): any => {
  if (typeof value === 'string') {
    // Remove HTML tags
    value = value.replace(/<[^>]*>/g, '');
    // Remove script tags content
    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Trim whitespace
    value = value.trim();
  } else if (typeof value === 'object' && value !== null) {
    // Recursively sanitize objects
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        value[key] = sanitizeString(value[key]);
      }
    }
  }
  return value;
};

/**
 * Validation middleware with sanitization
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Sanitize input before validation
    const sanitizedData = sanitizeString({ ...req[property] });
    
    const { error, value } = schema.validate(sanitizedData, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new ValidationError(errors);
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * General sanitization middleware for all requests
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeString(req.body);
  }
  if (req.query) {
    req.query = sanitizeString(req.query);
  }
  if (req.params) {
    req.params = sanitizeString(req.params);
  }
  next();
};
