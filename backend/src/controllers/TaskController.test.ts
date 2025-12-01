import request from 'supertest';
import express, { Application } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import errorHandler from '../middlewares/errorHandler';
import { Task } from '../domain/entities/Task';

// Create mock methods - must be let so we can reassign in beforeEach
let mockGetTasks: jest.Mock;
let mockCreateTask: jest.Mock;
let mockCompleteTask: jest.Mock;
let mockUpdateTask: jest.Mock;
let mockDeleteTask: jest.Mock;

// Mock TaskService module
jest.mock('../services/TaskService', () => {
  return jest.fn().mockImplementation(() => ({
    getTasks: (...args: any[]) => mockGetTasks(...args),
    createTask: (...args: any[]) => mockCreateTask(...args),
    completeTask: (...args: any[]) => mockCompleteTask(...args),
    updateTask: (...args: any[]) => mockUpdateTask(...args),
    deleteTask: (...args: any[]) => mockDeleteTask(...args),
  }));
});

// Mock authMiddleware
jest.mock('../middlewares/authMiddleware');

import taskRoutes from '../routes/taskRoutes';

describe('TaskController Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    // Initialize mock functions
    mockGetTasks = jest.fn();
    mockCreateTask = jest.fn();
    mockCompleteTask = jest.fn();
    mockUpdateTask = jest.fn();
    mockDeleteTask = jest.fn();

    // Create Express app
    app = express();
    app.use(express.json());

    // Mock authMiddleware to inject fake user
    (authMiddleware as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = { id: 1, email: 'test@example.com' };
      next();
    });

    // Use task routes
    app.use('/api/tasks', taskRoutes);

    // Add error handler
    app.use(errorHandler);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return 200 and list of tasks for authenticated user', async () => {
      // Arrange
      const now = new Date();
      const mockTasks = [
        new Task(1, 1, null, null, 'Task 1', 'Description 1', 'pending', 'high', null, now, now),
        new Task(2, 1, null, null, 'Task 2', 'Description 2', 'completed', 'low', null, now, now),
      ];

      mockGetTasks.mockResolvedValue(mockTasks);

      // Act
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer mock_token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        id: 1,
        userId: 1,
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        priority: 'high',
      });
      expect(mockGetTasks).toHaveBeenCalledWith(1);
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange - Mock authMiddleware to reject
      (authMiddleware as jest.Mock).mockImplementation((_req, res) => {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No authorization header provided',
        });
      });

      // Act
      const response = await request(app).get('/api/tasks');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/tasks', () => {
    it('should return 201 and create a new task', async () => {
      // Arrange
      const newTaskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'medium',
      };

      const mockCreatedTask = new Task(
        1,
        1,
        null, // projectId
        null, // assigneeId
        'New Task',
        'Task description',
        'pending',
        'medium',
        null,
        new Date(),
        new Date()
      );

      mockCreateTask.mockResolvedValue(mockCreatedTask);

      // Act
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer mock_token')
        .send(newTaskData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data).toMatchObject({
        id: 1,
        userId: 1,
        title: 'New Task',
        description: 'Task description',
        status: 'pending',
        priority: 'medium',
      });
    });

    it('should return 400 if title is missing', async () => {
      // Arrange
      const invalidTaskData = {
        description: 'Task without title',
      };

      // Act
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer mock_token')
        .send(invalidTaskData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('should return 200 and mark task as completed', async () => {
      // Arrange
      const taskId = 1;
      const mockCompletedTask = new Task(
        taskId,
        1,
        null, // projectId
        null, // assigneeId
        'Task',
        null,
        'completed',
        null,
        null,
        new Date(),
        new Date()
      );

      mockCompleteTask.mockResolvedValue(mockCompletedTask);

      // Act
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/complete`)
        .set('Authorization', 'Bearer mock_token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task marked as completed');
      expect(response.body.data.status).toBe('completed');
      expect(mockCompleteTask).toHaveBeenCalledWith(1, taskId);
    });

    it('should return 400 if task ID is invalid', async () => {
      // Act
      const response = await request(app)
        .patch('/api/tasks/invalid/complete')
        .set('Authorization', 'Bearer mock_token');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid task ID');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should return 200 and update task', async () => {
      // Arrange
      const taskId = 1;
      const updateData = {
        title: 'Updated Task',
        priority: 'high',
      };

      const mockUpdatedTask = new Task(
        taskId,
        1,
        null, // projectId
        null, // assigneeId
        'Updated Task',
        null,
        'pending',
        'high',
        null,
        new Date(),
        new Date()
      );

      mockUpdateTask.mockResolvedValue(mockUpdatedTask);

      // Act
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', 'Bearer mock_token')
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.data).toMatchObject({
        id: taskId,
        userId: 1,
        title: 'Updated Task',
        priority: 'high',
      });
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should return 200 and delete task', async () => {
      // Arrange
      const taskId = 1;
      mockDeleteTask.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', 'Bearer mock_token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
      expect(mockDeleteTask).toHaveBeenCalledWith(1, taskId);
    });
  });
});
