import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../domain/entities/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

// JWT payload interface
interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Attaches user info to request object if valid
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
      return;
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Expected: Bearer <token>',
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'colaborador', // Default to colaborador for backward compatibility
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error verifying token',
    });
  }
};

export default authMiddleware;
