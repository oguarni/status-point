import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

/**
 * LoginPage component
 * Handles user login
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginService({ email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.languageSwitcher}>
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            style={styles.languageSelector}
          >
            <option value="pt">🇧🇷 {t('language.portuguese')}</option>
            <option value="en">🇬🇧 {t('language.english')}</option>
          </select>
        </div>
        <div style={styles.logoContainer}>
          <img src="/android-chrome-512x512.png" alt="Agiliza" style={styles.logo} />
        </div>
        <h2 style={styles.title}>{t('auth.loginTitle')}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder={t('auth.email')}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder={t('auth.password')}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? t('common.loading') : t('auth.signIn')}
          </button>
        </form>

        <p style={styles.link}>
          {t('auth.noAccount')} <Link to="/register" style={styles.linkAnchor}>{t('auth.signUp')}</Link>
        </p>
      </div>
    </div>
  );
};

// Simple inline styles for the MVP
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#171717',
  },
  card: {
    backgroundColor: '#262626',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #404040',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  logo: {
    width: '250px',
    height: '250px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#E5E5E5',
    fontSize: '1.25rem',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '1rem',
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
  button: {
    padding: '0.75rem',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '1rem',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#dc3545',
    color: '#E5E5E5',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  link: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#b0b0b0',
  },
  linkAnchor: {
    color: '#F97316',
    textDecoration: 'none',
    fontWeight: '500',
  },
  languageSwitcher: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1rem',
  },
  languageSelector: {
    padding: '0.5rem',
    border: '1px solid #404040',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    backgroundColor: '#404040',
    color: '#E5E5E5',
  },
};

export default LoginPage;
