import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserRepository from '../repositories/UserRepository';
import { UserAlreadyExistsError, UserNotFoundError, InvalidPasswordError } from '../errors';

// Register DTO
interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

// Login DTO
interface LoginDTO {
  email: string;
  password: string;
}

// Auth response interface
interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// AuthService class - Business Logic Layer
class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  /**
   * Register a new user
   * @param registerData - User registration data
   * @returns Auth response with token and user data
   */
  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    const { name, email, password } = registerData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError('A user with this email already exists');
    }

    // Create new user (password will be hashed by the beforeCreate hook)
    const user = await this.userRepository.create({
      name,
      email,
      password_hash: password, // Will be hashed in the model hook
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: user.toSafeObject(),
    };
  }

  /**
   * Login user
   * @param loginData - User login credentials
   * @returns Auth response with token and user data
   */
  async login(loginData: LoginDTO): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidPasswordError('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: user.toSafeObject(),
    };
  }
}

export default AuthService;
