import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TaskDetailsModal from '../components/TaskDetailsModal';
import api from '../services/api';
import { getProjects, Project } from '../services/projectService';
import { useTranslation } from 'react-i18next';
import { formatDate as formatDateLocale } from '../utils/dateFormatter';

// Task interface
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high' | null;
  dueDate: string | null;
  projectId: number | null;
  created_at: string;
}

const TasksPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to load projects', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Build request payload, only including fields with values
      const payload: any = {
        title,
        priority,
      };

      // Only include description if it has a value
      if (description && description.trim()) {
        payload.description = description;
      }

      // Only include due_date if it has a value
      if (dueDate && dueDate.trim()) {
        payload.due_date = dueDate;
      }

      // Only include project_id if selected
      if (projectId !== null) {
        payload.project_id = projectId;
      }

      await api.post('/tasks', payload);

      resetForm();
      fetchTasks();
    } catch (err: any) {
      setError('Failed to create task');
      console.error(err);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      fetchTasks();
    } catch (err: any) {
      setError('Failed to complete task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm(t('tasks.deleteConfirm') || 'Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err: any) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setProjectId(null);
    setShowForm(false);
  };

  const getPriorityStyle = (priority: string | null): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
    };

    switch (priority) {
      case 'high':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'medium':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'low':
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
      default:
        return { ...baseStyle, backgroundColor: '#e9ecef', color: '#495057' };
    }
  };

  const formatDate = (dateString: string | null) => {
    return formatDateLocale(dateString, i18n.language);
  };

  const getProjectName = (projectId: number | null) => {
    if (!projectId) return null;
    const project = projects.find((p) => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.titleBar}>
          <h2 style={styles.pageTitle}>{t('tasks.title')}</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            {showForm ? t('common.cancel') : t('tasks.newTask')}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Create task form */}
        {showForm && (
          <form onSubmit={handleCreateTask} style={styles.form}>
            <h3>{t('tasks.newTask')}</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('tasks.taskTitle')} *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
                placeholder={t('tasks.taskTitle')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('tasks.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...styles.input, minHeight: '80px' }}
                placeholder={t('tasks.description')}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('tasks.priority')}</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  style={styles.input}
                >
                  <option value="low">{t('priority.low')}</option>
                  <option value="medium">{t('priority.medium')}</option>
                  <option value="high">{t('priority.high')}</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{t('tasks.dueDate')}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.input}
                  placeholder={i18n.language === 'pt' ? 'dd/mm/aaaa' : 'mm/dd/yyyy'}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('tasks.project')}</label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value) : null)}
                style={styles.input}
              >
                <option value="">{t('projects.noProject') || 'No Project'}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" style={styles.submitButton}>
              {t('tasks.newTask')}
            </button>
          </form>
        )}

        {/* Tasks list */}
        {loading ? (
          <p style={styles.loading}>{t('common.loading')}</p>
        ) : tasks.length === 0 ? (
          <p style={styles.emptyMessage}>{t('tasks.noTasks')}</p>
        ) : (
          <div style={styles.taskGrid}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={styles.taskCard}
                onClick={() => setSelectedTask(task)}
              >
                <div style={styles.taskHeader}>
                  <h3 style={task.status === 'completed' ? styles.completedTitle : styles.taskTitle}>
                    {task.title}
                  </h3>
                  <span style={getPriorityStyle(task.priority)}>
                    {task.priority ? t(`priority.${task.priority}`) : 'none'}
                  </span>
                </div>

                {task.description && <p style={styles.description}>{task.description}</p>}

                {task.projectId && (
                  <div style={styles.projectBadge}>{getProjectName(task.projectId)}</div>
                )}

                <div style={styles.taskFooter}>
                  <div style={styles.taskInfo}>
                    <span style={styles.status}>
                      {t('tasks.status')}: <strong>{t(`status.${task.status}`)}</strong>
                    </span>
                    {task.dueDate && (
                      <span style={styles.dueDate}>{t('tasks.dueDate')}: {formatDate(task.dueDate)}</span>
                    )}
                  </div>

                  <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        style={styles.completeButton}
                      >
                        {t('tasks.markComplete')}
                      </button>
                    )}
                    <button onClick={() => handleDeleteTask(task.id)} style={styles.deleteButton}>
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Details Modal */}
        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdate={fetchTasks}
          />
        )}
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  pageTitle: {
    margin: 0,
    fontSize: '2rem',
    color: '#E5E5E5',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#F97316',
    color: '#E5E5E5',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#dc3545',
    color: '#E5E5E5',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    color: '#b0b0b0',
    fontSize: '1.1rem',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#b0b0b0',
    fontSize: '1.1rem',
    padding: '3rem 1rem',
    backgroundColor: '#262626',
    borderRadius: '8px',
    border: '1px solid #404040',
  },
  form: {
    backgroundColor: '#262626',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    border: '1px solid #404040',
  },
  formGroup: {
    marginBottom: '1.5rem',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#E5E5E5',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #404040',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#171717',
    color: '#E5E5E5',
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#F97316',
    color: '#E5E5E5',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem',
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  taskCard: {
    backgroundColor: '#262626',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #404040',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '1rem',
  },
  taskTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#E5E5E5',
    flex: 1,
  },
  completedTitle: {
    margin: 0,
    fontSize: '1.25rem',
    textDecoration: 'line-through',
    color: '#6c6c6c',
    flex: 1,
  },
  description: {
    color: '#b0b0b0',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  projectBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    color: '#F97316',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '1rem',
    border: '1px solid #F97316',
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: '1rem',
    borderTop: '1px solid #404040',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  taskInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  status: {
    color: '#b0b0b0',
    fontSize: '0.875rem',
    textTransform: 'capitalize',
  },
  dueDate: {
    color: '#b0b0b0',
    fontSize: '0.875rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  completeButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: '#E5E5E5',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: '#E5E5E5',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
};

export default TasksPage;
