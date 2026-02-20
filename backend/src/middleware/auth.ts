import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

/**
 * Mock authentication middleware
 * In production, this would validate JWT tokens or session cookies
 * For now, we'll extract user from headers for testing
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract user role from header (x-user-role)
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    if (!userRole) {
      throw new UnauthorizedError('Authentication required. Please provide x-user-role header (ADMIN or USER)');
    }

    if (!Object.values(UserRole).includes(userRole.toUpperCase() as UserRole)) {
      throw new UnauthorizedError('Invalid role. Must be ADMIN or USER');
    }

    // Attach user to request
    req.user = {
      id: userId,
      role: userRole.toUpperCase() as UserRole
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require specific roles
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication - attaches user if present but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string || 'anonymous';

  if (userRole && Object.values(UserRole).includes(userRole.toUpperCase() as UserRole)) {
    req.user = {
      id: userId,
      role: userRole.toUpperCase() as UserRole
    };
  }

  next();
};
