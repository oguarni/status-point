import TaskAttachmentRepository from '../repositories/TaskAttachmentRepository';
import TaskRepository from '../repositories/TaskRepository';
import { TaskAttachment } from '../domain/entities/TaskAttachment';
import { AuthorizationError, UserNotFoundError } from '../errors';
import fs from 'fs/promises';

class TaskAttachmentService {
  private taskAttachmentRepository: TaskAttachmentRepository;
  private taskRepository: TaskRepository;

  constructor(taskAttachmentRepository: TaskAttachmentRepository, taskRepository: TaskRepository) {
    this.taskAttachmentRepository = taskAttachmentRepository;
    this.taskRepository = taskRepository;
  }

  async getTaskAttachments(userId: number, taskId: number): Promise<TaskAttachment[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // User must own the task to see attachments
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to view attachments for this task');
    }

    return await this.taskAttachmentRepository.findByTaskId(taskId);
  }

  async uploadAttachment(
    userId: number,
    taskId: number,
    file: Express.Multer.File
  ): Promise<TaskAttachment> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // User must own the task to upload attachments
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to upload attachments for this task');
    }

    return await this.taskAttachmentRepository.create({
      task_id: taskId,
      user_id: userId,
      filename: file.originalname,
      filepath: file.path,
      filesize: file.size,
      mimetype: file.mimetype,
    });
  }

  async deleteAttachment(userId: number, attachmentId: number): Promise<boolean> {
    const attachment = await this.taskAttachmentRepository.findById(attachmentId);
    if (!attachment) {
      throw new UserNotFoundError('Attachment not found');
    }

    // Only the uploader can delete the attachment
    if (!attachment.isUploadedBy(userId)) {
      throw new AuthorizationError('You can only delete your own attachments');
    }

    // Delete file from filesystem
    try {
      await fs.unlink(attachment.filepath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Continue even if file deletion fails
    }

    return await this.taskAttachmentRepository.delete(attachmentId);
  }

  async getAttachmentForDownload(userId: number, attachmentId: number): Promise<TaskAttachment> {
    const attachment = await this.taskAttachmentRepository.findById(attachmentId);
    if (!attachment) {
      throw new UserNotFoundError('Attachment not found');
    }

    // Verify user has access to the task
    const task = await this.taskRepository.findById(attachment.taskId);
    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // User must own the task to download attachments
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to download attachments for this task');
    }

    return attachment;
  }
}

export default TaskAttachmentService;
