import { Task } from '../domain/entities/Task';

// DTOs
export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: Date;
}

// Service Interface
export interface ITaskService {
  getTasks(userId: number): Promise<Task[]>;
  createTask(userId: number, data: CreateTaskDTO): Promise<Task>;
  completeTask(userId: number, taskId: number): Promise<Task>;
  updateTask(userId: number, taskId: number, data: UpdateTaskDTO): Promise<Task>;
  deleteTask(userId: number, taskId: number): Promise<boolean>;
}
