import { Project } from '../domain/entities/Project';

// DTOs
export interface CreateProjectDTO {
  gestor_id: number;
  title: string;
  description?: string | null;
  deadline: Date;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string | null;
  deadline?: Date;
}

// Repository Interface
export interface IProjectRepository {
  findById(id: number): Promise<Project | null>;
  findAllByGestorId(gestorId: number): Promise<Project[]>;
  create(data: CreateProjectDTO): Promise<Project>;
  update(id: number, data: UpdateProjectDTO): Promise<Project | null>;
  delete(id: number): Promise<boolean>;
}
