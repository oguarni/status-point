import { Router } from 'express';
import { body } from 'express-validator';
import TaskController from '../controllers/TaskController';
import TaskService from '../services/TaskService';
import TaskRepository from '../repositories/TaskRepository';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Initialize dependencies
const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

// All routes are protected by authMiddleware
router.use(authMiddleware);

// GET /api/tasks - List all tasks for the logged-in user
router.get('/', taskController.getTasks);

// GET /api/tasks/kanban - Get tasks organized as Kanban board
router.get('/kanban', taskController.getTasksKanban);

// POST /api/tasks - Create a new task
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 255 })
      .withMessage('Title must be at most 255 characters'),
    body('description')
      .optional()
      .trim(),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be one of: low, medium, high'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],
  taskController.createTask
);

// PATCH /api/tasks/:id/complete - Mark a task as completed
router.patch('/:id/complete', taskController.completeTask);

// PUT /api/tasks/:id - Update a task
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
      .trim(),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be one of: pending, completed'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be one of: low, medium, high'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],
  taskController.updateTask
);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', taskController.deleteTask);

export default router;
