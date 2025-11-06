import { ITaskRepository } from '../interfaces/ITaskRepository';
import { IUserRepository } from '../interfaces/IUserRepository';
import TaskRepository from '../repositories/TaskRepository';
import UserRepository from '../repositories/UserRepository';

/**
 * Factory for creating repository instances
 * Centralizes repository instantiation
 */
export class RepositoryFactory {
  /**
   * Create a TaskRepository instance
   * @returns ITaskRepository instance
   */
  static createTaskRepository(): ITaskRepository {
    return new TaskRepository();
  }

  /**
   * Create a UserRepository instance
   * @returns IUserRepository instance
   */
  static createUserRepository(): IUserRepository {
    return new UserRepository();
  }
}
