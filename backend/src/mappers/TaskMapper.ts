import { Task } from '../domain/entities/Task';
import TaskModel from '../models/Task';

// TaskAttributes for mapping back to model
export interface TaskAttributes {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high' | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Mapper to convert between Task domain entities and Sequelize models
 */
export class TaskMapper {
  /**
   * Convert Sequelize Task model to domain entity
   * @param model - Sequelize Task model
   * @returns Task domain entity
   */
  static toDomain(model: TaskModel): Task {
    return new Task(
      model.id,
      model.user_id,
      model.title,
      model.description,
      model.status,
      model.priority,
      model.due_date,
      model.created_at,
      model.updated_at
    );
  }

  /**
   * Convert Task domain entity to Sequelize model attributes
   * @param entity - Task domain entity
   * @returns Task attributes for Sequelize model
   */
  static toModel(entity: Task): TaskAttributes {
    return {
      id: entity.id,
      user_id: entity.userId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      due_date: entity.dueDate,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  /**
   * Convert array of Sequelize Task models to domain entities
   * @param models - Array of Sequelize Task models
   * @returns Array of Task domain entities
   */
  static toDomainList(models: TaskModel[]): Task[] {
    return models.map((model) => this.toDomain(model));
  }
}
