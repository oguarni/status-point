import ProjectRepository from '../repositories/ProjectRepository';
import UserRepository from '../repositories/UserRepository';
import { Project } from '../domain/entities/Project';
import { AuthorizationError, UserNotFoundError } from '../errors';
import { CreateProjectDTO, UpdateProjectDTO } from '../interfaces/IProjectRepository';

/**
 * ProjectService class - Business Logic Layer
 */
class ProjectService {
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor(projectRepository: ProjectRepository, userRepository: UserRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  /**
   * Get all projects for a gestor
   * @param userId - User ID (must be gestor or admin)
   * @returns Array of projects
   */
  async getProjects(userId: number): Promise<Project[]> {
    // Verify user exists and has permission
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    // If admin, could potentially see all projects, but for now only gestor's own projects
    return await this.projectRepository.findAllByGestorId(userId);
  }

  /**
   * Get a single project by ID
   * @param userId - User ID (for authorization)
   * @param projectId - Project ID
   * @returns Project
   */
  async getProject(userId: number, projectId: number): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new UserNotFoundError('Project not found');
    }

    // Verify user has permission to view (gestor of the project)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    // Admin can view any project, gestor can only view their own
    if (!user.isAdmin() && !project.isManagedBy(userId)) {
      throw new AuthorizationError('You are not authorized to view this project');
    }

    return project;
  }

  /**
   * Create a new project
   * @param userId - User ID (must be gestor or admin)
   * @param projectData - Project creation data
   * @returns Created project
   */
  async createProject(userId: number, projectData: Omit<CreateProjectDTO, 'gestor_id'>): Promise<Project> {
    // Verify user exists and has permission to create projects
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    if (!user.canCreateProjects()) {
      throw new AuthorizationError('Only administrators and gestors can create projects');
    }

    // Create project with user as gestor
    const project = await this.projectRepository.create({
      ...projectData,
      gestor_id: userId,
    });

    return project;
  }

  /**
   * Update a project
   * @param userId - User ID (must be the project gestor or admin)
   * @param projectId - Project ID
   * @param projectData - Project update data
   * @returns Updated project
   */
  async updateProject(userId: number, projectId: number, projectData: UpdateProjectDTO): Promise<Project> {
    // Fetch existing project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new UserNotFoundError('Project not found');
    }

    // Verify user has permission
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    // Only the gestor of the project or an admin can update it
    if (!user.isAdmin() && !project.isManagedBy(userId)) {
      throw new AuthorizationError('You are not authorized to modify this project');
    }

    // Update project
    const updatedProject = await this.projectRepository.update(projectId, projectData);
    if (!updatedProject) {
      throw new Error('Failed to update project');
    }

    return updatedProject;
  }

  /**
   * Delete a project
   * @param userId - User ID (must be the project gestor or admin)
   * @param projectId - Project ID
   * @returns true if deleted
   */
  async deleteProject(userId: number, projectId: number): Promise<boolean> {
    // Fetch existing project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new UserNotFoundError('Project not found');
    }

    // Verify user has permission
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    // Only the gestor of the project or an admin can delete it
    if (!user.isAdmin() && !project.isManagedBy(userId)) {
      throw new AuthorizationError('You are not authorized to delete this project');
    }

    // Delete project
    return await this.projectRepository.delete(projectId);
  }
}

export default ProjectService;
