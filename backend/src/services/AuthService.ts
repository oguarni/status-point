import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserRepository from '../repositories/UserRepository';
import { UserAlreadyExistsError, UserNotFoundError, InvalidPasswordError, AuthorizationError } from '../errors';
import { UserRole } from '../domain/entities/User';

// Register DTO
interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Login DTO
interface LoginDTO {
  email: string;
  password: string;
}

// Create User DTO (for admin)
interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Auth response interface
interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
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
   * Register a new user (public registration - defaults to colaborador role)
   * @param registerData - User registration data
   * @returns Auth response with token and user data
   */
  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    const { name, email, password, role = 'colaborador' } = registerData;

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
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: user.toSafeObject(),
    };
  }

  /**
   * Create a new user (admin only - can specify any role)
   * @param adminUserId - ID of the admin creating the user
   * @param userData - User creation data
   * @returns The created user
   */
  async createUser(adminUserId: number, userData: CreateUserDTO): Promise<AuthResponse> {
    // Verify admin has permission
    const admin = await this.userRepository.findById(adminUserId);
    if (!admin) {
      throw new UserNotFoundError('Admin user not found');
    }

    if (!admin.canManageUsers()) {
      throw new AuthorizationError('Only administrators can create users');
    }

    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError('A user with this email already exists');
    }

    // Create new user
    const user = await this.userRepository.create({
      name,
      email,
      password_hash: password,
      role,
    });

    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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
      { id: user.id, email: user.email, role: user.role },
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
export type { RegisterDTO, LoginDTO, CreateUserDTO, AuthResponse };
