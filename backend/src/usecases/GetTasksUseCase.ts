import { ITaskRepository, PaginationOptions, PaginatedResult } from '../interfaces/ITaskRepository';
import { ILogger } from '../utils/logger';
import { Task } from '../domain/entities/Task';

/**
 * Use case for retrieving tasks
 * Encapsulates business logic for task retrieval
 */
export class GetTasksUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private logger: ILogger
  ) {}

  /**
   * Execute the get tasks use case
   * @param userId - ID of the user retrieving tasks
   * @returns Array of task entities
   */
  async execute(userId: number): Promise<Task[]> {
    this.logger.info(`Retrieving tasks for user ${userId}`);

    const tasks = await this.taskRepository.findAllByUserId(userId);

    this.logger.info(`Retrieved ${tasks.length} tasks for user ${userId}`);
    return tasks;
  }

  /**
   * Execute the get tasks use case with pagination
   * @param userId - ID of the user retrieving tasks
   * @param options - Pagination options
   * @returns Paginated result with task entities
   */
  async executePaginated(userId: number, options: PaginationOptions): Promise<PaginatedResult<Task>> {
    this.logger.info(`Retrieving paginated tasks for user ${userId}`, {
      page: options.page,
      limit: options.limit,
    });

    // Validate pagination options
    if (options.page < 1) {
      throw new Error('Page number must be greater than 0');
    }

    if (options.limit < 1 || options.limit > 100) {
      throw new Error('Page limit must be between 1 and 100');
    }

    const result = await this.taskRepository.findAllByUserIdPaginated(userId, options);

    this.logger.info(`Retrieved ${result.data.length} tasks (page ${result.page} of ${result.totalPages})`);
    return result;
  }
}
