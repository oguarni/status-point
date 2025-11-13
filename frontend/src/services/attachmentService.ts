import api from './api';

// Attachment interface
export interface Attachment {
  id: number;
  task_id: number;
  user_id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  created_at: string;
}

// API Response
interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * Get all attachments for a task
 */
export const getTaskAttachments = async (taskId: number): Promise<Attachment[]> => {
  const response = await api.get<ApiResponse<Attachment[]>>(`/tasks/${taskId}/attachments`);
  return response.data.data;
};

/**
 * Upload an attachment to a task
 */
export const uploadAttachment = async (taskId: number, file: File): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<Attachment>>(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

/**
 * Delete an attachment
 */
export const deleteAttachment = async (attachmentId: number): Promise<void> => {
  await api.delete(`/attachments/${attachmentId}`);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
