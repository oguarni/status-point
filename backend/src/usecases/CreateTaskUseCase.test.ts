import { CreateTaskUseCase } from './CreateTaskUseCase';
import { ITaskRepository } from '../interfaces/ITaskRepository';
import { ILogger } from '../utils/logger';
import { Task } from '../domain/entities/Task';

describe('CreateTaskUseCase', () => {
  let mockRepository: jest.Mocked<ITaskRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      findAllByUserIdPaginated: jest.fn(),
      findAllByProjectId: jest.fn(),
      findAllByUserIdWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    useCase = new CreateTaskUseCase(mockRepository, mockLogger);
  });

  it('should create a task with valid data', async () => {
    const userId = 1;
    const input = {
      title: 'Test Task',
      description: 'Test description',
      priority: 'high' as const,
    };

    const mockTask = new Task(
      1,
      userId,
      null, // projectId
      null, // assigneeId
      input.title,
      input.description!,
      'todo',
      input.priority,
      null,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(mockTask);

    const result = await useCase.execute(userId, input);

    expect(result).toEqual(mockTask);
    expect(mockRepository.create).toHaveBeenCalledWith({
      user_id: userId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      due_date: undefined,
      status: 'todo',
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Creating task for user ${userId}`,
      { title: input.title }
    );
  });

  it('should fail when title is empty', async () => {
    const userId = 1;
    const input = {
      title: '',
    };

    await expect(useCase.execute(userId, input)).rejects.toThrow('Validation failed');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should fail when title is too long', async () => {
    const userId = 1;
    const input = {
      title: 'a'.repeat(256),
    };

    await expect(useCase.execute(userId, input)).rejects.toThrow('Validation failed');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should log validation errors', async () => {
    const userId = 1;
    const input = {
      title: '',
    };

    await expect(useCase.execute(userId, input)).rejects.toThrow();
    expect(mockLogger.warn).toHaveBeenCalledWith('Task validation failed', {
      errors: expect.any(Array),
    });
  });

  it('should create task with minimal data', async () => {
    const userId = 1;
    const input = {
      title: 'Simple Task',
    };

    const mockTask = new Task(
      1,
      userId,
      null, // projectId
      null, // assigneeId
      input.title,
      null,
      'todo',
      null,
      null,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(mockTask);

    const result = await useCase.execute(userId, input);

    expect(result).toEqual(mockTask);
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
