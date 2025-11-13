import { Request, Response, NextFunction } from 'express';
import TaskAttachmentService from '../services/TaskAttachmentService';

class TaskAttachmentController {
  private taskAttachmentService: TaskAttachmentService;

  constructor(taskAttachmentService: TaskAttachmentService) {
    this.taskAttachmentService = taskAttachmentService;
  }

  getAttachments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const taskId = parseInt(req.params.taskId, 10);

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      const attachments = await this.taskAttachmentService.getTaskAttachments(userId, taskId);

      res.status(200).json({
        message: 'Attachments retrieved successfully',
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const taskId = parseInt(req.params.taskId, 10);

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const attachment = await this.taskAttachmentService.uploadAttachment(userId, taskId, req.file);

      res.status(201).json({
        message: 'Attachment uploaded successfully',
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const attachmentId = parseInt(req.params.attachmentId, 10);

      if (isNaN(attachmentId)) {
        res.status(400).json({ error: 'Invalid attachment ID' });
        return;
      }

      await this.taskAttachmentService.deleteAttachment(userId, attachmentId);

      res.status(200).json({
        message: 'Attachment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  downloadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const attachmentId = parseInt(req.params.attachmentId, 10);

      if (isNaN(attachmentId)) {
        res.status(400).json({ error: 'Invalid attachment ID' });
        return;
      }

      const attachment = await this.taskAttachmentService.getAttachmentForDownload(userId, attachmentId);

      // Set content disposition header to trigger download
      res.download(attachment.filepath, attachment.filename, (err) => {
        if (err) {
          // If file doesn't exist or error occurs during download
          if (!res.headersSent) {
            res.status(404).json({ error: 'File not found' });
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TaskAttachmentController;
