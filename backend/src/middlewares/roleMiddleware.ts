import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../domain/entities/User';

/**
 * Role-based authorization middleware factory
 * Creates a middleware that checks if the authenticated user has one of the allowed roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 *
 * @example
 * // Only admins can access
 * router.post('/users', authMiddleware, requireRole(['admin']), controller.createUser);
 *
 * @example
 * // Admins and gestors can access
 * router.post('/projects', authMiddleware, requireRole(['admin', 'gestor']), controller.createProject);
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated (should be set by authMiddleware)
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        });
        return;
      }

      // User has required role, proceed
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking user role',
      });
    }
  };
};

/**
 * Middleware to check if user is admin
 * Shorthand for requireRole(['admin'])
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is gestor or admin
 * Shorthand for requireRole(['admin', 'gestor'])
 */
export const requireGestorOrAdmin = requireRole(['admin', 'gestor']);

export default requireRole;
