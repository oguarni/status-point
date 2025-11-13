import { TaskHistory } from '../domain/entities/TaskHistory';

export interface CreateTaskHistoryDTO {
  task_id: number;
  user_id: number;
  previous_status: 'pending' | 'completed' | null;
  new_status: 'pending' | 'completed';
}

export interface ITaskHistoryRepository {
  create(data: CreateTaskHistoryDTO): Promise<TaskHistory>;
  findByTaskId(taskId: number): Promise<TaskHistory[]>;
}
