import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  Project,
  CreateProjectData,
} from '../services/projectService';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const projectData: CreateProjectData = {
        title,
        description: description || undefined,
        deadline,
      };

      if (editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await createProject(projectData);
      }

      resetForm();
      fetchProjects();
    } catch (err: any) {
      setError(editingProject ? 'Failed to update project' : 'Failed to create project');
      console.error(err);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || '');
    setDeadline(project.deadline.split('T')[0]); // Format date for input
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
      return;
    }

    try {
      await deleteProject(id);
      fetchProjects();
    } catch (err: any) {
      setError('Failed to delete project');
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setShowForm(false);
    setEditingProject(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const isUrgent = (deadline: string) => {
    const daysRemaining = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.titleBar}>
          <h2 style={styles.pageTitle}>Projects</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter project title"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...styles.input, minHeight: '80px' }}
                placeholder="Enter project description (optional)"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Deadline *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton}>
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        {loading ? (
          <p style={styles.loading}>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p style={styles.emptyMessage}>
            No projects yet. Create your first project to get started!
          </p>
        ) : (
          <div style={styles.projectGrid}>
            {projects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  {isOverdue(project.deadline) && (
                    <span style={styles.overduebadge}>Overdue</span>
                  )}
                  {isUrgent(project.deadline) && !isOverdue(project.deadline) && (
                    <span style={styles.urgentBadge}>Urgent</span>
                  )}
                </div>

                {project.description && (
                  <p style={styles.description}>{project.description}</p>
                )}

                <div style={styles.projectMeta}>
                  <div style={styles.metaItem}>
                    <strong>Deadline:</strong> {formatDate(project.deadline)}
                  </div>
                  <div style={styles.metaItem}>
                    <strong>Created:</strong> {formatDate(project.created_at)}
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(project)} style={styles.editButton}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(project.id)} style={styles.deleteButton}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
  formActions: {
    display: 'flex',
    gap: '1rem',
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
  cancelButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  projectCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '1rem',
  },
  projectTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#333',
    flex: 1,
  },
  overdueBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  urgentBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#ffc107',
    color: '#000',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    color: '#666',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  projectMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
  metaItem: {
    fontSize: '0.9rem',
    color: '#555',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
  editButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export default ProjectsPage;
