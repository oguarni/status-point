import api from './api';

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador';
}

// Auth response interface
export interface AuthResponse {
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Register data interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 * @param data - User registration data
 * @returns Auth response with token and user data
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Login user
 * @param data - User login credentials
 * @returns Auth response with token and user data
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};
