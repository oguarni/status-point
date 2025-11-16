import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  Comment,
} from '../services/commentService';
import {
  getTaskAttachments,
  uploadAttachment,
  deleteAttachment,
  formatFileSize,
  Attachment,
} from '../services/attachmentService';
import { formatDateTime, formatDate as formatDateLocale } from '../utils/dateFormatter';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high' | null;
  dueDate: string | null;
}

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdate?: () => void; // Optional: call when task needs refresh
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose }) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details');
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'comments') {
      fetchComments();
    } else if (activeTab === 'attachments') {
      fetchAttachments();
    }
  }, [activeTab, task.id]);

  const fetchComments = async () => {
    try {
      const data = await getTaskComments(task.id);
      setComments(data);
      setError('');
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    }
  };

  const fetchAttachments = async () => {
    try {
      const data = await getTaskAttachments(task.id);
      setAttachments(data);
      setError('');
    } catch (err) {
      setError('Failed to load attachments');
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment(task.id, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, { content: editContent });
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (err) {
      setError('Failed to update comment');
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm(t('comments.deleteConfirm') || 'Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (err) {
      setError('Failed to delete comment');
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadAttachment(task.id, file);
      fetchAttachments();
      e.target.value = '';
    } catch (err) {
      setError('Failed to upload file');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!window.confirm(t('attachments.deleteConfirm') || 'Are you sure you want to delete this attachment?')) return;

    try {
      await deleteAttachment(attachmentId);
      fetchAttachments();
    } catch (err) {
      setError('Failed to delete attachment');
      console.error(err);
    }
  };

  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/attachments/${attachmentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create blob from response
      const blob = await response.blob();

      // Create temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download attachment');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateTime(dateString, i18n.language);
  };

  const formatDateOnly = (dateString: string) => {
    return formatDateLocale(dateString, i18n.language);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{task.title}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'details' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('details')}
          >
            {t('taskDetails.details')}
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'comments' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('comments')}
          >
            {t('taskDetails.comments')} ({comments.length})
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'attachments' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('attachments')}
          >
            {t('taskDetails.attachments')} ({attachments.length})
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'details' && (
            <div>
              <div style={styles.detailRow}>
                <strong>{t('tasks.status')}:</strong>
                <span style={styles.badge}>{t(`status.${task.status}`)}</span>
              </div>
              <div style={styles.detailRow}>
                <strong>{t('tasks.priority')}:</strong>
                <span style={styles.badge}>{task.priority ? t(`priority.${task.priority}`) : t('priority.none')}</span>
              </div>
              {task.dueDate && (
                <div style={styles.detailRow}>
                  <strong>{t('tasks.dueDate')}:</strong>
                  <span>{formatDateOnly(task.dueDate)}</span>
                </div>
              )}
              {task.description && (
                <div style={styles.detailRow}>
                  <strong>{t('tasks.description')}:</strong>
                  <p style={styles.description}>{task.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <form onSubmit={handleAddComment} style={styles.commentForm}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('comments.placeholder') || 'Write a comment...'}
                  style={styles.commentInput}
                  rows={3}
                />
                <button type="submit" style={styles.submitButton}>
                  {t('comments.add')}
                </button>
              </form>

              <div style={styles.commentsList}>
                {comments.length === 0 ? (
                  <p style={styles.emptyMessage}>{t('comments.empty')}</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} style={styles.commentCard}>
                      {editingComment?.id === comment.id ? (
                        <div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={styles.commentInput}
                            rows={3}
                          />
                          <div style={styles.commentActions}>
                            <button
                              onClick={() => handleUpdateComment(comment.id)}
                              style={styles.saveButton}
                            >
                              {t('common.save')}
                            </button>
                            <button
                              onClick={() => {
                                setEditingComment(null);
                                setEditContent('');
                              }}
                              style={styles.cancelButton}
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={styles.commentContent}>{comment.content}</p>
                          <div style={styles.commentMeta}>
                            <span style={styles.commentDate}>{formatDate(comment.created_at)}</span>
                            {comment.user_id === user?.id && (
                              <div style={styles.commentActions}>
                                <button
                                  onClick={() => {
                                    setEditingComment(comment);
                                    setEditContent(comment.content);
                                  }}
                                  style={styles.editButton}
                                >
                                  {t('common.edit')}
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  style={styles.deleteButton}
                                >
                                  {t('common.delete')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              <div style={styles.uploadSection}>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={styles.fileInput}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={styles.uploadButton}>
                  {uploading ? t('attachments.uploading') : t('attachments.chooseFile')}
                </label>
              </div>

              <div style={styles.attachmentsList}>
                {attachments.length === 0 ? (
                  <p style={styles.emptyMessage}>{t('attachments.empty')}</p>
                ) : (
                  attachments.map((attachment) => (
                    <div key={attachment.id} style={styles.attachmentCard}>
                      <div style={styles.attachmentInfo}>
                        <div style={styles.attachmentIcon}>📎</div>
                        <div>
                          <p style={styles.attachmentName}>{attachment.filename}</p>
                          <p style={styles.attachmentMeta}>
                            {formatFileSize(attachment.size)} • {formatDate(attachment.created_at)}
                          </p>
                        </div>
                      </div>
                      <div style={styles.attachmentActions}>
                        <button
                          onClick={() => handleDownloadAttachment(attachment.id, attachment.filename)}
                          style={styles.downloadButton}
                        >
                          {t('attachments.download')}
                        </button>
                        {attachment.user_id === user?.id && (
                          <button
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            style={styles.deleteButton}
                          >
                            {t('common.delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#0f3460',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    border: '2px solid #533483',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '2px solid #533483',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#e94560',
    fontWeight: '700',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#e0e0e0',
    lineHeight: 1,
    padding: 0,
    width: '32px',
    height: '32px',
    transition: 'color 0.3s',
  },
  error: {
    margin: '1rem 1.5rem 0',
    padding: '1rem',
    backgroundColor: '#e94560',
    color: '#ffffff',
    borderRadius: '6px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #533483',
    padding: '0 1.5rem',
  },
  tab: {
    padding: '1rem 1.5rem',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#b0b0b0',
    transition: 'all 0.3s',
  },
  tabActive: {
    color: '#e94560',
    borderBottomColor: '#e94560',
  },
  content: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  },
  detailRow: {
    marginBottom: '1rem',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
    color: '#e0e0e0',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#533483',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#e94560',
    border: '1px solid #e94560',
  },
  description: {
    margin: '0.5rem 0 0 0',
    color: '#b0b0b0',
    lineHeight: '1.6',
  },
  commentForm: {
    marginBottom: '1.5rem',
  },
  commentInput: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #533483',
    borderRadius: '6px',
    fontSize: '1rem',
    marginBottom: '0.5rem',
    boxSizing: 'border-box',
    resize: 'vertical',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
  },
  submitButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#888',
    padding: '2rem',
    fontStyle: 'italic',
  },
  commentCard: {
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '6px',
    borderLeft: '3px solid #e94560',
    border: '1px solid #533483',
  },
  commentContent: {
    margin: '0 0 0.5rem 0',
    color: '#e0e0e0',
    lineHeight: '1.5',
  },
  commentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentDate: {
    fontSize: '0.75rem',
    color: '#888',
  },
  commentActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: 'transparent',
    color: '#e94560',
    border: '1px solid #e94560',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: 'transparent',
    color: '#e94560',
    border: '1px solid #e94560',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  saveButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#533483',
    color: 'white',
    border: '1px solid #e94560',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  cancelButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: '1px solid #533483',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  uploadSection: {
    marginBottom: '1.5rem',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#533483',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    border: '1px solid #e94560',
    transition: 'background-color 0.3s',
  },
  attachmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  attachmentCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '6px',
    border: '1px solid #533483',
  },
  attachmentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
  },
  attachmentIcon: {
    fontSize: '2rem',
  },
  attachmentName: {
    margin: 0,
    fontWeight: '500',
    color: '#e0e0e0',
  },
  attachmentMeta: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.75rem',
    color: '#888',
  },
  attachmentActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  downloadButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
};

export default TaskDetailsModal;
