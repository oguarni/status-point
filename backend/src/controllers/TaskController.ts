import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import TaskService from '../services/TaskService';

// TaskController class - API Layer
class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  /**
   * Get all tasks for the logged-in user
   * GET /api/tasks
   */
  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get user ID from authenticated request
      const userId = req.user!.id;

      // Call service
      const tasks = await this.taskService.getTasks(userId);

      res.status(200).json({
        message: 'Tasks retrieved successfully',
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get tasks organized as Kanban board
   * GET /api/tasks/kanban
   */
  getTasksKanban = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const kanban = await this.taskService.getTasksKanban(userId);

      res.status(200).json({
        message: 'Kanban board retrieved successfully',
        data: kanban,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search and filter tasks
   * GET /api/tasks/search?search=keyword&status=todo&priority=high&projectId=1
   */
  searchTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { search, status, priority, projectId } = req.query;

      // Build filters object
      const filters: any = {};
      if (search) filters.search = search as string;
      if (status) filters.status = status as string;
      if (priority) filters.priority = priority as string;
      if (projectId) filters.projectId = parseInt(projectId as string, 10);

      const tasks = await this.taskService.searchTasks(userId, filters);

      res.status(200).json({
        message: 'Tasks retrieved successfully',
        data: tasks,
        filters: filters, // Return applied filters for debugging
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new task
   * POST /api/tasks
   */
  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Get user ID from authenticated request
      const userId = req.user!.id;
      const { title, description, priority, due_date, project_id } = req.body;

      // Call service
      const task = await this.taskService.createTask(userId, {
        title,
        description,
        priority,
        due_date: due_date ? new Date(due_date) : undefined,
        project_id: project_id || null,
      });

      res.status(201).json({
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark a task as completed
   * PATCH /api/tasks/:id/complete
   */
  completeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get user ID from authenticated request
      const userId = req.user!.id;
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      // Call service
      const task = await this.taskService.completeTask(userId, taskId);

      res.status(200).json({
        message: 'Task marked as completed',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a task
   * PUT /api/tasks/:id
   */
  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Get user ID from authenticated request
      const userId = req.user!.id;
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      const { title, description, status, priority, due_date, project_id } = req.body;

      // Call service
      const task = await this.taskService.updateTask(userId, taskId, {
        title,
        description,
        status,
        priority,
        due_date: due_date ? new Date(due_date) : undefined,
        project_id: project_id !== undefined ? project_id : undefined,
      });

      res.status(200).json({
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get task history
   * GET /api/tasks/:id/history
   */
  getTaskHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      const history = await this.taskService.getTaskHistory(userId, taskId);

      res.status(200).json({
        message: 'Task history retrieved successfully',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a task
   * DELETE /api/tasks/:id
   */
  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get user ID from authenticated request
      const userId = req.user!.id;
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      // Call service
      await this.taskService.deleteTask(userId, taskId);

      res.status(200).json({
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TaskController;
