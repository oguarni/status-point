import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AuthService from '../services/AuthService';

// AuthController class - API Layer
class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Handle user registration
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, email, password } = req.body;

      // Call service
      const result = await this.authService.register({ name, email, password });

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle user login
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Call service
      const result = await this.authService.login({ email, password });

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle user creation by admin
   * POST /api/auth/users
   * Requires authentication and admin role
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const adminUserId = req.user!.id;
      const { name, email, password, role } = req.body;

      // Call service
      const result = await this.authService.createUser(adminUserId, { name, email, password, role });

      res.status(201).json({
        message: 'User created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
