import api from './api';

// Project interface
export interface Project {
  id: number;
  gestor_id: number;
  title: string;
  description: string | null;
  deadline: string;
  created_at: string;
  updated_at: string;
}

// Create project data
export interface CreateProjectData {
  title: string;
  description?: string;
  deadline: string;
}

// Update project data
export interface UpdateProjectData {
  title?: string;
  description?: string;
  deadline?: string;
}

// API Response
interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * Get all projects for the authenticated user
 */
export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get<ApiResponse<Project[]>>('/projects');
  return response.data.data;
};

/**
 * Get a single project by ID
 */
export const getProject = async (id: number): Promise<Project> => {
  const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
  return response.data.data;
};

/**
 * Create a new project
 */
export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const response = await api.post<ApiResponse<Project>>('/projects', data);
  return response.data.data;
};

/**
 * Update a project
 */
export const updateProject = async (id: number, data: UpdateProjectData): Promise<Project> => {
  const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
  return response.data.data;
};

/**
 * Delete a project
 */
export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/projects/${id}`);
};
