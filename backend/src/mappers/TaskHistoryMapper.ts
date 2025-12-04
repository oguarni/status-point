import { TaskHistory } from '../domain/entities/TaskHistory';
import TaskHistoryModel from '../models/TaskHistory';

export interface TaskHistoryAttributes {
  id: number;
  task_id: number;
  user_id: number;
  previous_status: 'todo' | 'in_progress' | 'completed' | 'blocked' | null;
  new_status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  created_at: Date;
}

export class TaskHistoryMapper {
  static toDomain(model: TaskHistoryModel): TaskHistory {
    return new TaskHistory(
      model.id,
      model.task_id,
      model.user_id,
      model.previous_status,
      model.new_status,
      model.created_at
    );
  }

  static toDomainList(models: TaskHistoryModel[]): TaskHistory[] {
    return models.map(model => this.toDomain(model));
  }
}
