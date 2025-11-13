import axios from 'axios';

// Create Axios instance with base URL
// CRITICAL: Use relative URL '/api' instead of absolute 'http://localhost:3001/api'
// This allows the Vite proxy (configured in vite.config.ts) to forward requests
// to the backend service. The proxy will automatically route '/api' to 'http://backend:3001/api'
// in Docker, making the frontend work seamlessly in both Docker and local environments.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
