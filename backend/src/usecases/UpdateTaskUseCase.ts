import { ITaskRepository, UpdateTaskDTO } from '../interfaces/ITaskRepository';
import { ILogger } from '../utils/logger';
import { Task } from '../domain/entities/Task';
import { TaskValidator } from '../validators/TaskValidator';
import { AuthorizationError, UserNotFoundError } from '../errors';

/**
 * Use case for updating an existing task
 * Encapsulates business logic for task updates
 */
export class UpdateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private logger: ILogger
  ) {}

  /**
   * Execute the update task use case
   * @param userId - ID of the user updating the task
   * @param taskId - ID of the task to update
   * @param data - Task update data
   * @returns Updated task entity
   */
  async execute(userId: number, taskId: number, data: UpdateTaskDTO): Promise<Task> {
    this.logger.info(`Updating task ${taskId} for user ${userId}`);

    // Validate input data
    const validation = TaskValidator.validateUpdate(data);
    if (!validation.isValid) {
      this.logger.warn('Task validation failed', { errors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Find the task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      this.logger.warn(`Task ${taskId} not found`);
      throw new UserNotFoundError('Task not found');
    }

    // CRITICAL: Authorization check - user must own the task
    if (!task.isOwnedBy(userId)) {
      this.logger.warn(`User ${userId} attempted to update task ${taskId} owned by user ${task.userId}`);
      throw new AuthorizationError('You are not authorized to modify this task');
    }

    // Update the task
    const updatedTask = await this.taskRepository.update(taskId, data);

    if (!updatedTask) {
      this.logger.error(`Failed to update task ${taskId}`);
      throw new Error('Failed to update task');
    }

    this.logger.info(`Task ${taskId} updated successfully`);
    return updatedTask;
  }
}
