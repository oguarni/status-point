import { Project as ProjectModel } from '../models';
import { Project } from '../domain/entities/Project';
import { ProjectMapper } from '../mappers/ProjectMapper';
import { CreateProjectDTO, UpdateProjectDTO } from '../interfaces/IProjectRepository';

/**
 * ProjectRepository class - Data Access Layer
 */
class ProjectRepository {
  /**
   * Find a project by ID
   * @param id - Project's ID
   * @returns Project domain entity or null if not found
   */
  async findById(id: number): Promise<Project | null> {
    try {
      const project = await ProjectModel.findByPk(id);
      return project ? ProjectMapper.toDomain(project) : null;
    } catch (error) {
      throw new Error(`Error finding project by ID: ${error}`);
    }
  }

  /**
   * Find all projects by gestor ID
   * @param gestorId - Gestor's user ID
   * @returns Array of Project domain entities
   */
  async findAllByGestorId(gestorId: number): Promise<Project[]> {
    try {
      const projects = await ProjectModel.findAll({
        where: { gestor_id: gestorId },
        order: [['deadline', 'ASC']],
      });
      return ProjectMapper.toDomainList(projects);
    } catch (error) {
      throw new Error(`Error finding projects by gestor ID: ${error}`);
    }
  }

  /**
   * Create a new project
   * @param projectData - Project creation data
   * @returns Created project domain entity
   */
  async create(projectData: CreateProjectDTO): Promise<Project> {
    try {
      const project = await ProjectModel.create(projectData);
      return ProjectMapper.toDomain(project);
    } catch (error) {
      throw new Error(`Error creating project: ${error}`);
    }
  }

  /**
   * Update a project
   * @param id - Project ID
   * @param projectData - Project update data
   * @returns Updated project domain entity or null if not found
   */
  async update(id: number, projectData: UpdateProjectDTO): Promise<Project | null> {
    try {
      const project = await ProjectModel.findByPk(id);
      if (!project) {
        return null;
      }

      await project.update(projectData);
      return ProjectMapper.toDomain(project);
    } catch (error) {
      throw new Error(`Error updating project: ${error}`);
    }
  }

  /**
   * Delete a project
   * @param id - Project ID
   * @returns true if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await ProjectModel.destroy({
        where: { id },
      });
      return result > 0;
    } catch (error) {
      throw new Error(`Error deleting project: ${error}`);
    }
  }
}

export default ProjectRepository;
