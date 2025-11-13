import { Router } from 'express';
import { body } from 'express-validator';
import ProjectController from '../controllers/ProjectController';
import ProjectService from '../services/ProjectService';
import ProjectRepository from '../repositories/ProjectRepository';
import UserRepository from '../repositories/UserRepository';
import authMiddleware from '../middlewares/authMiddleware';
import { requireGestorOrAdmin } from '../middlewares/roleMiddleware';

const router = Router();

// Initialize dependencies
const projectRepository = new ProjectRepository();
const userRepository = new UserRepository();
const projectService = new ProjectService(projectRepository, userRepository);
const projectController = new ProjectController(projectService);

// All routes require authentication
router.use(authMiddleware);

// GET /api/projects - Get all projects for authenticated user
router.get(
  '/',
  projectController.getProjects
);

// GET /api/projects/:id - Get single project
router.get(
  '/:id',
  projectController.getProject
);

// POST /api/projects - Create new project (gestor or admin only)
router.post(
  '/',
  requireGestorOrAdmin,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 255 })
      .withMessage('Title must be at most 255 characters'),
    body('description')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Description must be at most 5000 characters'),
    body('deadline')
      .notEmpty()
      .withMessage('Deadline is required')
      .isISO8601()
      .withMessage('Deadline must be a valid date'),
  ],
  projectController.createProject
);

// PUT /api/projects/:id - Update project
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 255 })
      .withMessage('Title must be at most 255 characters'),
    body('description')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Description must be at most 5000 characters'),
    body('deadline')
      .optional()
      .isISO8601()
      .withMessage('Deadline must be a valid date'),
  ],
  projectController.updateProject
);

// DELETE /api/projects/:id - Delete project
router.delete(
  '/:id',
  projectController.deleteProject
);

export default router;
