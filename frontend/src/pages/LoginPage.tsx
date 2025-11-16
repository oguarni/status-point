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
          <img src="/favicon/android-chrome-192x192.png" alt="Agiliza" style={styles.logo} />
        </div>
        <h1 style={styles.title}>{t('auth.loginTitle')}</h1>
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
          {t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link>
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
    backgroundColor: '#1a1a2e',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  card: {
    backgroundColor: '#0f3460',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#e94560',
    fontSize: '1.8rem',
    fontWeight: '700',
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
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '0.85rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#e94560',
    color: '#ffffff',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  link: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#e0e0e0',
  },
  languageSwitcher: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1rem',
  },
  languageSelector: {
    padding: '0.5rem',
    border: '2px solid #533483',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  logo: {
    width: '180px',
    height: 'auto',
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
  },
};

export default LoginPage;
