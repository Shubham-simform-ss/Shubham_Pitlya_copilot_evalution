import morgan from 'morgan';
import { config } from '../config/env';

/**
 * Custom Morgan token for execution time in milliseconds
 */
morgan.token('execution-time', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '0ms';
});

/**
 * Custom Morgan format: [METHOD] /endpoint - Execution time: Xms
 */
export const customFormat = '[:method] :url - Execution time: :response-time ms';

/**
 * Development format with more details
 */
export const devFormat = '[:method] :url :status - Execution time: :response-time ms - :res[content-length] bytes';

/**
 * Get Morgan middleware based on environment
 */
export const getLogger = () => {
  if (config.nodeEnv === 'test') {
    return morgan('combined', { skip: () => true });
  }
  
  if (config.nodeEnv === 'development') {
    return morgan(devFormat);
  }
  
  // Production - minimal logging
  return morgan(customFormat, {
    skip: (req, res) => res.statusCode < 400 // Only log errors in production
  });
};

/**
 * Morgan middleware for all requests
 */
export const requestLogger = getLogger();
