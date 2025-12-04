import { Task } from '../domain/entities/Task';

// DTOs
export interface CreateTaskDTO {
  user_id: number;
  project_id?: number | null;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
  status?: 'todo' | 'in_progress' | 'completed' | 'blocked';
}

export interface UpdateTaskDTO {
  project_id?: number | null;
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
}

// Pagination interfaces
export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Search/Filter DTO
export interface TaskSearchFilters {
  search?: string;
  status?: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  projectId?: number;
}

// Repository Interface
export interface ITaskRepository {
  findById(id: number): Promise<Task | null>;
  findAllByUserId(userId: number): Promise<Task[]>;
  findAllByUserIdWithFilters(userId: number, filters: TaskSearchFilters): Promise<Task[]>;
  findAllByProjectId(projectId: number): Promise<Task[]>;
  findAllByUserIdPaginated(userId: number, options: PaginationOptions): Promise<PaginatedResult<Task>>;
  create(data: CreateTaskDTO): Promise<Task>;
  update(id: number, data: UpdateTaskDTO): Promise<Task | null>;
  delete(id: number): Promise<boolean>;
}
