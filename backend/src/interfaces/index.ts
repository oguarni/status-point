// Service Interfaces
export type { ITaskService } from './ITaskService';
export type { IAuthService } from './IAuthService';

// Repository Interfaces
export type {
  ITaskRepository,
  PaginationOptions,
  PaginatedResult,
} from './ITaskRepository';
export type { IUserRepository } from './IUserRepository';

// Re-export DTOs with explicit names to avoid conflicts
export type {
  CreateTaskDTO as ServiceCreateTaskDTO,
  UpdateTaskDTO as ServiceUpdateTaskDTO,
} from './ITaskService';

export type {
  CreateTaskDTO as RepoCreateTaskDTO,
  UpdateTaskDTO as RepoUpdateTaskDTO,
} from './ITaskRepository';

export type { CreateUserDTO } from './IUserRepository';
export type { RegisterDTO, LoginDTO, AuthResponse } from './IAuthService';
