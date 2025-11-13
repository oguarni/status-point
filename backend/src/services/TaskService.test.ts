import TaskService from './TaskService';
import TaskRepository from '../repositories/TaskRepository';
import TaskHistoryRepository from '../repositories/TaskHistoryRepository';
import { AuthorizationError, UserNotFoundError } from '../errors';
import { Task } from '../domain/entities/Task';

// Mock repositories
jest.mock('../repositories/TaskRepository');
jest.mock('../repositories/TaskHistoryRepository');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockTaskHistoryRepository: jest.Mocked<TaskHistoryRepository>;

  beforeEach(() => {
    mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    mockTaskHistoryRepository = new TaskHistoryRepository() as jest.Mocked<TaskHistoryRepository>;
    mockTaskHistoryRepository.create = jest.fn().mockResolvedValue({} as any);
    taskService = new TaskService(mockTaskRepository, mockTaskHistoryRepository);
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return all tasks for a user', async () => {
      // Arrange
      const userId = 1;
      const mockTasks = [
        {
          id: 1,
          user_id: userId,
          title: 'Task 1',
          status: 'pending',
        },
        {
          id: 2,
          user_id: userId,
          title: 'Task 2',
          status: 'completed',
        },
      ];

      mockTaskRepository.findAllByUserId.mockResolvedValue(mockTasks as any);

      // Act
      const result = await taskService.getTasks(userId);

      // Assert
      expect(mockTaskRepository.findAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('createTask', () => {
    it('should create a new task for a user', async () => {
      // Arrange
      const userId = 1;
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high' as const,
      };

      const mockCreatedTask = {
        id: 1,
        user_id: userId,
        ...taskData,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockTaskRepository.create.mockResolvedValue(mockCreatedTask as any);

      // Act
      const result = await taskService.createTask(userId, taskData);

      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        ...taskData,
      });
      expect(result).toEqual(mockCreatedTask);
    });
  });

  describe('completeTask', () => {
    it('should successfully complete a task owned by the user', async () => {
      // Arrange
      const userId = 1;
      const taskId = 1;
      const mockTask = new Task(
        taskId,
        userId,
        null, // projectId
        'Task',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      const mockUpdatedTask = new Task(
        taskId,
        userId,
        null, // projectId
        'Task',
        null,
        'completed',
        null,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(mockUpdatedTask);

      // Act
      const result = await taskService.completeTask(userId, taskId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        status: 'completed',
      });
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should throw AuthorizationError if task belongs to different user', async () => {
      // Arrange
      const userId = 1;
      const differentUserId = 2;
      const taskId = 1;

      const mockTask = new Task(
        taskId,
        differentUserId, // Different user!
        null, // projectId
        'Task',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(taskService.completeTask(userId, taskId)).rejects.toThrow(AuthorizationError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError if task does not exist', async () => {
      // Arrange
      const userId = 1;
      const taskId = 999;

      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.completeTask(userId, taskId)).rejects.toThrow(UserNotFoundError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw Error if repository update fails', async () => {
      // Arrange
      const userId = 1;
      const taskId = 1;
      const mockTask = new Task(
        taskId,
        userId,
        null, // projectId
        'Task',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(null); // Simulate update failure

      // Act & Assert
      await expect(taskService.completeTask(userId, taskId)).rejects.toThrow('Failed to update task');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('should successfully update a task owned by the user', async () => {
      // Arrange
      const userId = 1;
      const taskId = 1;
      const updateData = {
        title: 'Updated Task',
        priority: 'low' as const,
      };

      const mockTask = new Task(
        taskId,
        userId,
        null, // projectId
        'Original Task',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      const mockUpdatedTask = new Task(
        taskId,
        userId,
        null, // projectId
        'Updated Task',
        null,
        'pending',
        'low',
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(mockUpdatedTask);

      // Act
      const result = await taskService.updateTask(userId, taskId, updateData);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should throw AuthorizationError if task belongs to different user', async () => {
      // Arrange
      const userId = 1;
      const differentUserId = 2;
      const taskId = 1;
      const updateData = { title: 'Updated Task' };

      const mockTask = new Task(
        taskId,
        differentUserId, // Different user!
        null, // projectId
        'Original Task',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(taskService.updateTask(userId, taskId, updateData)).rejects.toThrow(
        AuthorizationError
      );
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError if task does not exist', async () => {
      // Arrange
      const userId = 1;
      const taskId = 999;
      const updateData = { title: 'Updated Task' };

      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.updateTask(userId, taskId, updateData)).rejects.toThrow(
        UserNotFoundError
      );
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw Error if repository update fails', async () => {
      // Arrange
      const userId = 1;
      const taskId = 1;
      const updateData = { title: 'Updated Task' };
      const mockTask = new Task(
        taskId,
        userId,
        null, // projectId
        'Original Task',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(null); // Simulate update failure

      // Act & Assert
      await expect(taskService.updateTask(userId, taskId, updateData)).rejects.toThrow(
        'Failed to update task'
      );
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should successfully delete a task owned by the user', async () => {
      // Arrange
      const userId = 1;
      const taskId = 1;

      const mockTask = new Task(
        taskId,
        userId,
        null, // projectId
        'Task to delete',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.delete.mockResolvedValue(true);

      // Act
      const result = await taskService.deleteTask(userId, taskId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
      expect(result).toBe(true);
    });

    it('should throw AuthorizationError if task belongs to different user', async () => {
      // Arrange
      const userId = 1;
      const differentUserId = 2;
      const taskId = 1;

      const mockTask = new Task(
        taskId,
        differentUserId, // Different user!
        null, // projectId
        'Task',
        null,
        'pending',
        null,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(taskService.deleteTask(userId, taskId)).rejects.toThrow(AuthorizationError);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError if task does not exist', async () => {
      // Arrange
      const userId = 1;
      const taskId = 999;

      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.deleteTask(userId, taskId)).rejects.toThrow(UserNotFoundError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });
  });
});
