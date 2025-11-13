import AuthService from './AuthService';
import UserRepository from '../repositories/UserRepository';
import { UserAlreadyExistsError, UserNotFoundError, InvalidPasswordError } from '../errors';
import { User } from '../domain/entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../repositories/UserRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Create mock repository
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService(mockUserRepository);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const mockUser = new User(
        1,
        'Test User',
        'test@example.com',
        'hashed_password',
        new Date(),
        new Date()
      );

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: registerData.name,
        email: registerData.email,
        password_hash: registerData.password,
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token: 'mock_token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw UserAlreadyExistsError if email is already registered', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        email: 'test@example.com',
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser as any);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(UserAlreadyExistsError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockUser = new User(
        1,
        'Test User',
        'test@example.com',
        'hashed_password',
        new Date(),
        new Date()
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token: 'mock_token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(UserNotFoundError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw InvalidPasswordError if password is incorrect', async () => {
      // Arrange
      const mockUser = new User(
        1,
        'Test User',
        'test@example.com',
        'hashed_password',
        new Date(),
        new Date()
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(InvalidPasswordError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});
