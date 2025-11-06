import { Task as TaskModel } from '../models';
import { Task } from '../domain/entities/Task';
import { TaskMapper } from '../mappers/TaskMapper';
import { CreateTaskDTO, UpdateTaskDTO, PaginationOptions, PaginatedResult } from '../interfaces/ITaskRepository';

// TaskRepository class - Data Access Layer
class TaskRepository {
  /**
   * Find a task by ID
   * @param id - Task's ID
   * @returns Task domain entity or null if not found
   */
  async findById(id: number): Promise<Task | null> {
    try {
      const task = await TaskModel.findByPk(id);
      return task ? TaskMapper.toDomain(task) : null;
    } catch (error) {
      throw new Error(`Error finding task by ID: ${error}`);
    }
  }

  /**
   * Find all tasks for a specific user
   * @param userId - User's ID
   * @returns Array of task domain entities
   */
  async findAllByUserId(userId: number): Promise<Task[]> {
    try {
      const tasks = await TaskModel.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });
      return TaskMapper.toDomainList(tasks);
    } catch (error) {
      throw new Error(`Error finding tasks by user ID: ${error}`);
    }
  }

  /**
   * Create a new task
   * @param taskData - Task creation data
   * @returns Created task domain entity
   */
  async create(taskData: CreateTaskDTO): Promise<Task> {
    try {
      const task = await TaskModel.create(taskData);
      return TaskMapper.toDomain(task);
    } catch (error) {
      throw new Error(`Error creating task: ${error}`);
    }
  }

  /**
   * Update a task
   * @param id - Task's ID
   * @param taskData - Task update data
   * @returns Updated task domain entity or null if not found
   */
  async update(id: number, taskData: UpdateTaskDTO): Promise<Task | null> {
    try {
      const task = await TaskModel.findByPk(id);
      if (!task) {
        return null;
      }

      await task.update(taskData);
      return TaskMapper.toDomain(task);
    } catch (error) {
      throw new Error(`Error updating task: ${error}`);
    }
  }

  /**
   * Delete a task
   * @param id - Task's ID
   * @returns true if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const task = await TaskModel.findByPk(id);
      if (!task) {
        return false;
      }

      await task.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting task: ${error}`);
    }
  }

  /**
   * Find all tasks for a user with pagination
   * @param userId - User's ID
   * @param options - Pagination options
   * @returns Paginated result with task domain entities
   */
  async findAllByUserIdPaginated(
    userId: number,
    options: PaginationOptions
  ): Promise<PaginatedResult<Task>> {
    try {
      const offset = (options.page - 1) * options.limit;

      const { rows, count } = await TaskModel.findAndCountAll({
        where: { user_id: userId },
        limit: options.limit,
        offset,
        order: [[options.orderBy || 'created_at', options.order || 'DESC']],
      });

      return {
        data: TaskMapper.toDomainList(rows),
        total: count,
        page: options.page,
        totalPages: Math.ceil(count / options.limit),
      };
    } catch (error) {
      throw new Error(`Error finding paginated tasks by user ID: ${error}`);
    }
  }
}

export default TaskRepository;
