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
import { useTranslation } from 'react-i18next';
import { formatDateLong } from '../utils/dateFormatter';

const ProjectsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
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
    if (!window.confirm(t('projects.deleteConfirm') || 'Are you sure you want to delete this project?')) {
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
    return formatDateLong(dateString, i18n.language);
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
          <h2 style={styles.pageTitle}>{t('projects.title')}</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            {showForm ? t('common.cancel') : t('projects.newProject')}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={{ color: '#e94560' }}>{editingProject ? t('projects.editProject') : t('projects.newProject')}</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('projects.projectTitle')} *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
                placeholder={t('projects.projectTitle')}
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

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('projects.deadline')} *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                style={styles.input}
                placeholder={i18n.language === 'pt' ? 'dd/mm/aaaa' : 'mm/dd/yyyy'}
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton}>
                {editingProject ? t('common.update') : t('common.create')}
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Projects List */}
        {loading ? (
          <p style={styles.loading}>{t('common.loading')}</p>
        ) : projects.length === 0 ? (
          <p style={styles.emptyMessage}>
            {t('projects.noProjects')}
          </p>
        ) : (
          <div style={styles.projectGrid}>
            {projects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  {isOverdue(project.deadline) && (
                    <span style={styles.overdueBadge}>{t('projects.overdue')}</span>
                  )}
                  {isUrgent(project.deadline) && !isOverdue(project.deadline) && (
                    <span style={styles.urgentBadge}>{t('projects.urgent')}</span>
                  )}
                </div>

                {project.description && (
                  <p style={styles.description}>{project.description}</p>
                )}

                <div style={styles.projectMeta}>
                  <div style={styles.metaItem}>
                    <strong>{t('projects.deadline')}:</strong> {formatDate(project.deadline)}
                  </div>
                  <div style={styles.metaItem}>
                    <strong>{t('projects.created')}:</strong> {formatDate(project.created_at)}
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(project)} style={styles.editButton}>
                    {t('common.edit')}
                  </button>
                  <button onClick={() => handleDelete(project.id)} style={styles.deleteButton}>
                    {t('common.delete')}
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
    color: '#e94560',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#e94560',
    color: '#ffffff',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    color: '#e0e0e0',
    fontSize: '1.1rem',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#e0e0e0',
    fontSize: '1.1rem',
    padding: '3rem 1rem',
    backgroundColor: '#0f3460',
    borderRadius: '8px',
  },
  form: {
    backgroundColor: '#0f3460',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    border: '1px solid #533483',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#e0e0e0',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #533483',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
  cancelButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#533483',
    color: 'white',
    border: '1px solid #e94560',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  projectCard: {
    backgroundColor: '#0f3460',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #533483',
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
    color: '#ffffff',
    flex: 1,
  },
  overdueBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#e94560',
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
    color: '#b0b0b0',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  projectMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #533483',
  },
  metaItem: {
    fontSize: '0.9rem',
    color: '#e0e0e0',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #533483',
  },
  editButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#533483',
    color: 'white',
    border: '1px solid #e94560',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
};

export default ProjectsPage;
