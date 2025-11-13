import { Project } from '../domain/entities/Project';
import ProjectModel from '../models/Project';

// ProjectAttributes for mapping back to model
export interface ProjectAttributes {
  id: number;
  gestor_id: number;
  title: string;
  description: string | null;
  deadline: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Mapper to convert between Project domain entities and Sequelize models
 */
export class ProjectMapper {
  /**
   * Convert Sequelize Project model to domain entity
   * @param model - Sequelize Project model
   * @returns Project domain entity
   */
  static toDomain(model: ProjectModel): Project {
    return new Project(
      model.id,
      model.gestor_id,
      model.title,
      model.description,
      model.deadline,
      model.created_at,
      model.updated_at
    );
  }

  /**
   * Convert Project domain entity to Sequelize model attributes
   * @param entity - Project domain entity
   * @returns Project attributes for Sequelize model
   */
  static toModel(entity: Project): ProjectAttributes {
    return {
      id: entity.id,
      gestor_id: entity.gestorId,
      title: entity.title,
      description: entity.description,
      deadline: entity.deadline,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  /**
   * Convert array of Sequelize Project models to domain entities
   * @param models - Array of Sequelize Project models
   * @returns Array of Project domain entities
   */
  static toDomainList(models: ProjectModel[]): Project[] {
    return models.map((model) => this.toDomain(model));
  }
}
