import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high' | null;
  dueDate: string | null;
  userId: number;
  projectId: number | null;
}

interface KanbanData {
  pending: Task[];
  completed: Task[];
}

const KanbanPage: React.FC = () => {
  const [kanbanData, setKanbanData] = useState<KanbanData>({ pending: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/kanban');
      setKanbanData(response.data.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load kanban board');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: 'pending' | 'completed') => {
    try {
      if (newStatus === 'completed') {
        await api.patch(`/tasks/${taskId}/complete`);
      } else {
        await api.put(`/tasks/${taskId}`, { status: 'pending' });
      }
      fetchKanbanData();
    } catch (err: any) {
      setError('Failed to update task status');
      console.error(err);
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const TaskCard: React.FC<{ task: Task; onStatusChange: (status: 'pending' | 'completed') => void }> = ({
    task,
    onStatusChange,
  }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
      <div
        style={{
          ...styles.taskCard,
          ...(isDragging ? styles.taskCardDragging : {}),
        }}
        draggable
        onDragStart={(e) => {
          setIsDragging(true);
          e.dataTransfer.setData('taskId', task.id.toString());
          e.dataTransfer.setData('currentStatus', task.status);
        }}
        onDragEnd={() => setIsDragging(false)}
      >
        <div style={styles.taskHeader}>
          <h4 style={styles.taskTitle}>{task.title}</h4>
          {task.priority && (
            <div
              style={{
                ...styles.priorityDot,
                backgroundColor: getPriorityColor(task.priority),
              }}
              title={task.priority}
            />
          )}
        </div>

        {task.description && <p style={styles.taskDescription}>{task.description}</p>}

        <div style={styles.taskFooter}>
          {task.dueDate && (
            <span
              style={{
                ...styles.dueDate,
                ...(isOverdue(task.dueDate) ? styles.dueDateOverdue : {}),
              }}
            >
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <div style={styles.taskActions}>
          {task.status === 'pending' && (
            <button onClick={() => onStatusChange('completed')} style={styles.completeButton}>
              Mark Complete
            </button>
          )}
          {task.status === 'completed' && (
            <button onClick={() => onStatusChange('pending')} style={styles.reopenButton}>
              Reopen
            </button>
          )}
        </div>
      </div>
    );
  };

  const Column: React.FC<{ title: string; status: 'pending' | 'completed'; tasks: Task[] }> = ({
    title,
    status,
    tasks,
  }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = () => {
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const taskId = parseInt(e.dataTransfer.getData('taskId'));
      const currentStatus = e.dataTransfer.getData('currentStatus');

      if (currentStatus !== status) {
        handleTaskStatusChange(taskId, status);
      }
    };

    return (
      <div
        style={{
          ...styles.column,
          ...(isDragOver ? styles.columnDragOver : {}),
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={styles.columnHeader}>
          <h3 style={styles.columnTitle}>{title}</h3>
          <span style={styles.taskCount}>{tasks.length}</span>
        </div>

        <div style={styles.columnContent}>
          {tasks.length === 0 ? (
            <p style={styles.emptyColumn}>No tasks in this column</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(newStatus) => handleTaskStatusChange(task.id, newStatus)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.titleBar}>
          <h2 style={styles.pageTitle}>Kanban Board</h2>
          <p style={styles.subtitle}>Drag and drop tasks to change their status</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <p style={styles.loading}>Loading kanban board...</p>
        ) : (
          <div style={styles.board}>
            <Column title="To Do" status="pending" tasks={kanbanData.pending} />
            <Column title="Completed" status="completed" tasks={kanbanData.completed} />
          </div>
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
    marginBottom: '2rem',
  },
  pageTitle: {
    margin: 0,
    fontSize: '2rem',
    color: '#333',
  },
  subtitle: {
    margin: '0.5rem 0 0 0',
    color: '#666',
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
    padding: '3rem',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    alignItems: 'start',
  },
  column: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '1rem',
    minHeight: '500px',
    transition: 'background-color 0.2s',
  },
  columnDragOver: {
    backgroundColor: '#e3f2fd',
    boxShadow: '0 0 0 2px #2196f3',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #dee2e6',
  },
  columnTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
  },
  taskCount: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  columnContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  emptyColumn: {
    textAlign: 'center',
    color: '#999',
    padding: '2rem 1rem',
    fontStyle: 'italic',
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: '6px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'grab',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  taskCardDragging: {
    opacity: 0.5,
    cursor: 'grabbing',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    gap: '0.5rem',
  },
  taskTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priorityDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '0.25rem',
  },
  taskDescription: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.875rem',
    color: '#666',
    lineHeight: '1.4',
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  dueDate: {
    fontSize: '0.75rem',
    color: '#666',
    backgroundColor: '#e9ecef',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  dueDateOverdue: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    fontWeight: '600',
  },
  taskActions: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #eee',
  },
  completeButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  reopenButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
};

export default KanbanPage;
