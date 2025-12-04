import { ITaskRepository, CreateTaskDTO as RepoCreateTaskDTO } from '../interfaces/ITaskRepository';
import { ILogger } from '../utils/logger';
import { Task } from '../domain/entities/Task';
import { TaskValidator } from '../validators/TaskValidator';

/**
 * Input DTO for CreateTaskUseCase
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
}

/**
 * Use case for creating a new task
 * Encapsulates business logic for task creation
 */
export class CreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private logger: ILogger
  ) {}

  /**
   * Execute the create task use case
   * @param userId - ID of the user creating the task
   * @param input - Task creation data
   * @returns Created task entity
   */
  async execute(userId: number, input: CreateTaskInput): Promise<Task> {
    this.logger.info(`Creating task for user ${userId}`, { title: input.title });

    // Validate input data
    const validation = TaskValidator.validateCreate(input);
    if (!validation.isValid) {
      this.logger.warn('Task validation failed', { errors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Additional business validations
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    if (input.title.length > 255) {
      throw new Error('Title is too long (maximum 255 characters)');
    }

    // Create task through repository
    const taskData: RepoCreateTaskDTO = {
      user_id: userId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      due_date: input.due_date,
      status: 'todo',
    };

    const task = await this.taskRepository.create(taskData);

    this.logger.info(`Task ${task.id} created successfully`, {
      taskId: task.id,
      userId: userId,
    });

    return task;
  }
}
