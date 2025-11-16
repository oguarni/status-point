import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { path: '/tasks', label: t('nav.myTasks'), roles: ['admin', 'gestor', 'colaborador'] },
    { path: '/kanban', label: t('nav.kanbanBoard'), roles: ['admin', 'gestor', 'colaborador'] },
    { path: '/projects', label: t('nav.projects'), roles: ['admin', 'gestor'] },
  ];

  const isActive = (path: string) => location.pathname === path;

  const canAccessRoute = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Task Management System</h1>
          <nav style={styles.nav}>
            {navItems.map((item) =>
              canAccessRoute(item.roles) ? (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.navButton,
                    ...(isActive(item.path) ? styles.navButtonActive : {}),
                  }}
                >
                  {item.label}
                </button>
              ) : null
            )}
          </nav>
          <div style={styles.userSection}>
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={styles.languageSelector}
              title={t('language.selectLanguage')}
            >
              <option value="pt">🇧🇷 {t('language.portuguese')}</option>
              <option value="en">🇬🇧 {t('language.english')}</option>
            </select>
            <span style={styles.userName}>
              {user?.name} ({t(`roles.${user?.role}`)})
            </span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#171717',
  },
  header: {
    backgroundColor: '#262626',
    color: '#E5E5E5',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#E5E5E5',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#E5E5E5',
    border: '2px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: '#F97316',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  languageSelector: {
    padding: '0.5rem',
    backgroundColor: '#404040',
    color: '#E5E5E5',
    border: '1px solid #404040',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#b0b0b0',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#F97316',
    color: '#E5E5E5',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
};

export default Layout;
