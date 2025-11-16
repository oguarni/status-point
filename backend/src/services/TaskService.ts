import TaskRepository from '../repositories/TaskRepository';
import TaskHistoryRepository from '../repositories/TaskHistoryRepository';
import { AuthorizationError, UserNotFoundError } from '../errors';
import { Task } from '../domain/entities/Task';

// Create task DTO
interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
  project_id?: number | null;
}

// Update task DTO
interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
  project_id?: number | null;
}

// TaskService class - Business Logic Layer
class TaskService {
  private taskRepository: TaskRepository;
  private taskHistoryRepository: TaskHistoryRepository;

  constructor(taskRepository: TaskRepository, taskHistoryRepository?: TaskHistoryRepository) {
    this.taskRepository = taskRepository;
    this.taskHistoryRepository = taskHistoryRepository || new TaskHistoryRepository();
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
   * CRITICAL: Checks authorization - owner, admin, or gestor can complete
   * @param userId - User's ID
   * @param taskId - Task's ID
   * @param userRole - User's role (admin, gestor, colaborador)
   * @returns Updated task
   */
  async completeTask(userId: number, taskId: number, userRole: string): Promise<Task> {
    // Find task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // CRITICAL: Authorization check - owner, admin, or gestor can modify
    const canModify = task.isOwnedBy(userId) || userRole === 'admin' || userRole === 'gestor';
    if (!canModify) {
      throw new AuthorizationError('You are not authorized to modify this task');
    }

    const previousStatus = task.status;

    // Update status to completed
    const updatedTask = await this.taskRepository.update(taskId, {
      status: 'completed',
    });

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    // Record status change in history
    if (previousStatus !== 'completed') {
      await this.taskHistoryRepository.create({
        task_id: taskId,
        user_id: userId,
        previous_status: previousStatus,
        new_status: 'completed',
      });
    }

    return updatedTask;
  }

  /**
   * Update a task
   * CRITICAL: Checks authorization - owner, admin, or gestor can update
   * @param userId - User's ID
   * @param taskId - Task's ID
   * @param userRole - User's role (admin, gestor, colaborador)
   * @param taskData - Task update data
   * @returns Updated task
   */
  async updateTask(userId: number, taskId: number, userRole: string, taskData: UpdateTaskDTO): Promise<Task> {
    // Find task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // CRITICAL: Authorization check - owner, admin, or gestor can modify
    const canModify = task.isOwnedBy(userId) || userRole === 'admin' || userRole === 'gestor';
    if (!canModify) {
      throw new AuthorizationError('You are not authorized to modify this task');
    }

    const previousStatus = task.status;

    // Update task
    const updatedTask = await this.taskRepository.update(taskId, taskData);

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    // Record status change in history if status was changed
    if (taskData.status && taskData.status !== previousStatus) {
      await this.taskHistoryRepository.create({
        task_id: taskId,
        user_id: userId,
        previous_status: previousStatus,
        new_status: taskData.status,
      });
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
   * Get task history
   * @param userId - User's ID
   * @param taskId - Task's ID
   * @returns Array of task history records
   */
  async getTaskHistory(userId: number, taskId: number) {
    // Find task
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // User must own the task to see its history
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to view this task history');
    }

    return await this.taskHistoryRepository.findByTaskId(taskId);
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

    // Delete task (history will be cascade deleted)
    const deleted = await this.taskRepository.delete(taskId);
    return deleted;
  }
}

export default TaskService;
