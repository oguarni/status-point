import TaskRepository from '../repositories/TaskRepository';
import { AuthorizationError, UserNotFoundError } from '../errors';
import { Task } from '../domain/entities/Task';

// Create task DTO
interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
}

// Update task DTO
interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
}

// TaskService class - Business Logic Layer
class TaskService {
  private taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Get all tasks for a user
   * @param userId - User's ID
   * @returns Array of tasks
   */
  async getTasks(userId: number): Promise<Task[]> {
    const tasks = await this.taskRepository.findAllByUserId(userId);
    return tasks;
  }

  /**
   * Create a new task for a user
   * @param userId - User's ID
   * @param taskData - Task creation data
   * @returns Created task
   */
  async createTask(userId: number, taskData: CreateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.create({
      user_id: userId,
      ...taskData,
    });
    return task;
  }

  /**
   * Mark a task as completed
   * CRITICAL: Checks if the task belongs to the user before updating
   * @param userId - User's ID
   * @param taskId - Task's ID
   * @returns Updated task
   */
  async completeTask(userId: number, taskId: number): Promise<Task> {
    // Find task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // CRITICAL: Authorization check - user must own the task
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to modify this task');
    }

    // Update status to completed
    const updatedTask = await this.taskRepository.update(taskId, {
      status: 'completed',
    });

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return updatedTask;
  }

  /**
   * Update a task
   * CRITICAL: Checks if the task belongs to the user before updating
   * @param userId - User's ID
   * @param taskId - Task's ID
   * @param taskData - Task update data
   * @returns Updated task
   */
  async updateTask(userId: number, taskId: number, taskData: UpdateTaskDTO): Promise<Task> {
    // Find task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // CRITICAL: Authorization check - user must own the task
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to modify this task');
    }

    // Update task
    const updatedTask = await this.taskRepository.update(taskId, taskData);

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return updatedTask;
  }

  /**
   * Get tasks organized as Kanban board (grouped by status)
   * @param userId - User's ID
   * @returns Tasks grouped by status
   */
  async getTasksKanban(userId: number): Promise<{ pending: Task[]; completed: Task[] }> {
    const tasks = await this.taskRepository.findAllByUserId(userId);

    const kanban = {
      pending: tasks.filter(task => task.status === 'pending'),
      completed: tasks.filter(task => task.status === 'completed'),
    };

    return kanban;
  }

  /**
   * Delete a task
   * CRITICAL: Checks if the task belongs to the user before deleting
   * @param userId - User's ID
   * @param taskId - Task's ID
   * @returns true if deleted successfully
   */
  async deleteTask(userId: number, taskId: number): Promise<boolean> {
    // Find task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // CRITICAL: Authorization check - user must own the task
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to delete this task');
    }

    // Delete task
    const deleted = await this.taskRepository.delete(taskId);
    return deleted;
  }
}

export default TaskService;
