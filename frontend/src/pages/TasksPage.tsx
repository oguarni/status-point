import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TaskDetailsModal from '../components/TaskDetailsModal';
import api from '../services/api';
import { getProjects, Project } from '../services/projectService';

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
      await api.post('/tasks', {
        title,
        description: description || undefined,
        priority,
        due_date: dueDate || undefined,
        project_id: projectId,
      });

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
    if (!window.confirm('Are you sure you want to delete this task?')) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
          <h2 style={styles.pageTitle}>My Tasks</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            {showForm ? 'Cancel' : 'New Task'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Create task form */}
        {showForm && (
          <form onSubmit={handleCreateTask} style={styles.form}>
            <h3>Create New Task</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter task title"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...styles.input, minHeight: '80px' }}
                placeholder="Enter task description (optional)"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  style={styles.input}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Project (optional)</label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value) : null)}
                style={styles.input}
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" style={styles.submitButton}>
              Create Task
            </button>
          </form>
        )}

        {/* Tasks list */}
        {loading ? (
          <p style={styles.loading}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p style={styles.emptyMessage}>No tasks yet. Create your first task!</p>
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
                  <span style={getPriorityStyle(task.priority)}>{task.priority || 'none'}</span>
                </div>

                {task.description && <p style={styles.description}>{task.description}</p>}

                {task.projectId && (
                  <div style={styles.projectBadge}>{getProjectName(task.projectId)}</div>
                )}

                <div style={styles.taskFooter}>
                  <div style={styles.taskInfo}>
                    <span style={styles.status}>
                      Status: <strong>{task.status}</strong>
                    </span>
                    {task.dueDate && (
                      <span style={styles.dueDate}>Due: {formatDate(task.dueDate)}</span>
                    )}
                  </div>

                  <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        style={styles.completeButton}
                      >
                        Complete
                      </button>
                    )}
                    <button onClick={() => handleDeleteTask(task.id)} style={styles.deleteButton}>
                      Delete
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
    color: '#333',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    color: '#777',
    fontSize: '1.1rem',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#777',
    fontSize: '1.1rem',
    padding: '3rem 1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#007bff',
    color: 'white',
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
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
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
    color: '#333',
    flex: 1,
  },
  completedTitle: {
    margin: 0,
    fontSize: '1.25rem',
    textDecoration: 'line-through',
    color: '#999',
    flex: 1,
  },
  description: {
    color: '#666',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  projectBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '1rem',
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  taskInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  status: {
    color: '#555',
    fontSize: '0.875rem',
    textTransform: 'capitalize',
  },
  dueDate: {
    color: '#666',
    fontSize: '0.875rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  completeButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
};

export default TasksPage;
