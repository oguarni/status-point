import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ProjectService from '../services/ProjectService';

/**
 * ProjectController class - API Layer
 */
class ProjectController {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  /**
   * Handle get all projects
   * GET /api/projects
   */
  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const projects = await this.projectService.getProjects(userId);

      res.status(200).json({
        message: 'Projects retrieved successfully',
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle get single project
   * GET /api/projects/:id
   */
  getProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }

      const project = await this.projectService.getProject(userId, projectId);

      res.status(200).json({
        message: 'Project retrieved successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle project creation
   * POST /api/projects
   */
  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user!.id;
      const { title, description, deadline } = req.body;

      const project = await this.projectService.createProject(userId, {
        title,
        description,
        deadline: new Date(deadline),
      });

      res.status(201).json({
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle project update
   * PUT /api/projects/:id
   */
  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user!.id;
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }

      const { title, description, deadline } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (deadline !== undefined) updateData.deadline = new Date(deadline);

      const project = await this.projectService.updateProject(userId, projectId, updateData);

      res.status(200).json({
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle project deletion
   * DELETE /api/projects/:id
   */
  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }

      await this.projectService.deleteProject(userId, projectId);

      res.status(200).json({
        message: 'Project deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectController;
