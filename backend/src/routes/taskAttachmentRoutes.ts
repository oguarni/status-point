import { Router } from 'express';
import TaskAttachmentController from '../controllers/TaskAttachmentController';
import TaskAttachmentService from '../services/TaskAttachmentService';
import TaskAttachmentRepository from '../repositories/TaskAttachmentRepository';
import TaskRepository from '../repositories/TaskRepository';
import authMiddleware from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

const taskAttachmentRepository = new TaskAttachmentRepository();
const taskRepository = new TaskRepository();
const taskAttachmentService = new TaskAttachmentService(taskAttachmentRepository, taskRepository);
const taskAttachmentController = new TaskAttachmentController(taskAttachmentService);

router.use(authMiddleware);

// GET /api/tasks/:taskId/attachments - Get all attachments for a task
router.get('/tasks/:taskId/attachments', taskAttachmentController.getAttachments);

// POST /api/tasks/:taskId/attachments - Upload an attachment
router.post(
  '/tasks/:taskId/attachments',
  upload.single('file'),
  taskAttachmentController.uploadAttachment
);

// GET /api/attachments/:attachmentId/download - Download an attachment
router.get('/attachments/:attachmentId/download', taskAttachmentController.downloadAttachment);

// DELETE /api/attachments/:attachmentId - Delete an attachment
router.delete('/attachments/:attachmentId', taskAttachmentController.deleteAttachment);

export default router;
