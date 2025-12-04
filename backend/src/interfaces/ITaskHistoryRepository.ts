import { TaskHistory } from '../domain/entities/TaskHistory';

export interface CreateTaskHistoryDTO {
  task_id: number;
  user_id: number;
  previous_status: 'todo' | 'in_progress' | 'completed' | 'blocked' | null;
  new_status: 'todo' | 'in_progress' | 'completed' | 'blocked';
}

export interface ITaskHistoryRepository {
  create(data: CreateTaskHistoryDTO): Promise<TaskHistory>;
  findByTaskId(taskId: number): Promise<TaskHistory[]>;
}
