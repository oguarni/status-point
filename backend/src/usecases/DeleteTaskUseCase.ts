import { ITaskRepository } from '../interfaces/ITaskRepository';
import { ILogger } from '../utils/logger';
import { AuthorizationError, UserNotFoundError } from '../errors';

/**
 * Use case for deleting a task
 * Encapsulates business logic for task deletion
 */
export class DeleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private logger: ILogger
  ) {}

  /**
   * Execute the delete task use case
   * @param userId - ID of the user deleting the task
   * @param taskId - ID of the task to delete
   * @returns true if deletion was successful
   */
  async execute(userId: number, taskId: number): Promise<boolean> {
    this.logger.info(`Deleting task ${taskId} for user ${userId}`);

    // Find the task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      this.logger.warn(`Task ${taskId} not found`);
      throw new UserNotFoundError('Task not found');
    }

    // CRITICAL: Authorization check - user must own the task
    if (!task.isOwnedBy(userId)) {
      this.logger.warn(`User ${userId} attempted to delete task ${taskId} owned by user ${task.userId}`);
      throw new AuthorizationError('You are not authorized to delete this task');
    }

    // Delete the task
    const deleted = await this.taskRepository.delete(taskId);

    if (deleted) {
      this.logger.info(`Task ${taskId} deleted successfully`);
    } else {
      this.logger.error(`Failed to delete task ${taskId}`);
    }

    return deleted;
  }
}
