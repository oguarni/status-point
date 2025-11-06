import { ITaskService } from '../interfaces/ITaskService';
import { IAuthService } from '../interfaces/IAuthService';
import TaskService from '../services/TaskService';
import AuthService from '../services/AuthService';
import { RepositoryFactory } from './RepositoryFactory';

/**
 * Factory for creating service instances
 * Centralizes service instantiation with proper dependency injection
 */
export class ServiceFactory {
  /**
   * Create a TaskService instance with dependencies
   * @returns ITaskService instance
   */
  static createTaskService(): ITaskService {
    const repository = RepositoryFactory.createTaskRepository();
    return new TaskService(repository as any); // Will be properly typed after refactoring
  }

  /**
   * Create an AuthService instance with dependencies
   * @returns IAuthService instance
   */
  static createAuthService(): IAuthService {
    const repository = RepositoryFactory.createUserRepository();
    return new AuthService(repository as any); // Will be properly typed after refactoring
  }
}
