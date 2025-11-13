import api from './api';

// Comment interface
export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// Create comment data
export interface CreateCommentData {
  content: string;
}

// Update comment data
export interface UpdateCommentData {
  content: string;
}

// API Response
interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * Get all comments for a task
 */
export const getTaskComments = async (taskId: number): Promise<Comment[]> => {
  const response = await api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);
  return response.data.data;
};

/**
 * Create a new comment on a task
 */
export const createComment = async (taskId: number, data: CreateCommentData): Promise<Comment> => {
  const response = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, data);
  return response.data.data;
};

/**
 * Update a comment
 */
export const updateComment = async (commentId: number, data: UpdateCommentData): Promise<Comment> => {
  const response = await api.put<ApiResponse<Comment>>(`/comments/${commentId}`, data);
  return response.data.data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};
