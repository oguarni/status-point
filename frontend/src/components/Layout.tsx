import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/tasks', label: 'My Tasks', roles: ['admin', 'gestor', 'colaborador'] },
    { path: '/kanban', label: 'Kanban Board', roles: ['admin', 'gestor', 'colaborador'] },
    { path: '/projects', label: 'Projects', roles: ['admin', 'gestor'] },
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
            <span style={styles.userName}>
              {user?.name} ({user?.role})
            </span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    color: '#007bff',
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
