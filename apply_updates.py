import os
from pathlib import Path

# CONFIGURATION
# -----------------------------------------------------------------------------
PROJECT_ROOT = Path(os.path.expanduser("~/Desktop/Engenharia de Software 2025-2/Arquitetura de Software/Projeto"))

# FILE CONTENTS
# -----------------------------------------------------------------------------
FILES = {}

# 1. Update UserRepository to include findAll (Sequelize)
FILES["backend/src/repositories/UserRepository.ts"] = """
import { User as UserModel } from '../models';
import { User } from '../domain/entities/User';
import { UserMapper } from '../mappers/UserMapper';
import { CreateUserDTO } from '../interfaces/IUserRepository';

// UserRepository class - Data Access Layer
class UserRepository {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({
        where: { email },
      });
      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error}`);
    }
  }

  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | null> {
    try {
      const user = await UserModel.findByPk(id);
      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error}`);
    }
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserDTO): Promise<User> {
    try {
      const user = await UserModel.create(userData);
      return UserMapper.toDomain(user);
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  /**
   * Find all users
   * Used for task assignment dropdowns
   */
  async findAll(): Promise<User[]> {
    try {
      const users = await UserModel.findAll({
        order: [['name', 'ASC']]
      });
      return UserMapper.toDomainList(users);
    } catch (error) {
      throw new Error(`Error retrieving all users: ${error}`);
    }
  }
}

export default UserRepository;
"""

# 2. Update AuthService to expose getUsers
FILES["backend/src/services/AuthService.ts"] = """
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

  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    const { name, email, password } = registerData;
    const role: UserRole = 'colaborador'; 

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError('A user with this email already exists');
    }

    const user = await this.userRepository.create({
      name,
      email,
      password_hash: password, 
      role,
    });

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

  async createUser(adminUserId: number, userData: CreateUserDTO): Promise<AuthResponse> {
    const admin = await this.userRepository.findById(adminUserId);
    if (!admin) {
      throw new UserNotFoundError('Admin user not found');
    }

    if (!admin.canManageUsers()) {
      throw new AuthorizationError('Only administrators can create users');
    }

    const { name, email, password, role } = userData;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError('A user with this email already exists');
    }

    const user = await this.userRepository.create({
      name,
      email,
      password_hash: password,
      role,
    });

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

  async login(loginData: LoginDTO): Promise<AuthResponse> {
    const { email, password } = loginData;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidPasswordError('Invalid email or password');
    }

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

  async getUsers(): Promise<any[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => user.toSafeObject());
  }
}

export default AuthService;
export type { RegisterDTO, LoginDTO, CreateUserDTO, AuthResponse };
"""

# 3. Update AuthController to handle getUsers request
FILES["backend/src/controllers/AuthController.ts"] = """
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AuthService from '../services/AuthService';

// AuthController class - API Layer
class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const { name, email, password } = req.body;
      const result = await this.authService.register({ name, email, password });
      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });
      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const adminUserId = req.user!.id;
      const { name, email, password, role } = req.body;
      const result = await this.authService.createUser(adminUserId, { name, email, password, role });
      res.status(201).json({
        message: 'User created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.authService.getUsers();
      res.status(200).json({
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
"""

# 4. Update AuthRoutes to expose GET /users
FILES["backend/src/routes/authRoutes.ts"] = """
import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/AuthController';
import AuthService from '../services/AuthService';
import UserRepository from '../repositories/UserRepository';
import authMiddleware from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';

const router = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 255 }),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

router.post(
  '/users',
  authMiddleware,
  requireAdmin,
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 255 }),
    body('email').trim().notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isLength({ min: 6 }),
    body('role').trim().notEmpty().isIn(['admin', 'gestor', 'colaborador']),
  ],
  authController.createUser
);

// New route for fetching users (protected)
router.get(
  '/users',
  authMiddleware,
  authController.getUsers
);

export default router;
"""

# 5. Create frontend/src/services/userService.ts
FILES["frontend/src/services/userService.ts"] = """
import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador';
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/auth/users');
  return response.data.data;
};
"""

# 6. Update TaskDetailsModal to include User Select
FILES["frontend/src/components/TaskDetailsModal.tsx"] = """
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlignLeft, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../services/api';
import { getAllUsers, User as UserModel } from '../services/userService';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: number, updates: Partial<Task>) => Promise<void>;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [users, setUsers] = useState<UserModel[]>([]);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
    // Fetch users when modal opens
    if (isOpen) {
      getAllUsers().then(setUsers).catch(console.error);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    if (task.id) {
      await onUpdate(task.id, editedTask);
      setIsEditing(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: AlertCircle, color: 'text-yellow-500' },
    { value: 'completed', label: 'Completed', icon: CheckSquare, color: 'text-green-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
            {isEditing ? (
                <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="text-xl font-bold w-full border rounded px-2 py-1"
                />
            ) : (
                <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
            )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status & Assignment Row */}
          <div className="grid grid-cols-2 gap-4">
             {/* Status */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                {isEditing ? (
                    <select
                        value={editedTask.status}
                        onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as 'pending' | 'completed' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                ) : (
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        {task.status === 'completed' ? <CheckSquare className="text-green-500" size={18} /> : <Clock className="text-yellow-500" size={18} />}
                        <span className="capitalize">{task.status}</span>
                    </div>
                )}
             </div>

             {/* Assignee */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                {isEditing ? (
                    <select
                        value={editedTask.userId || ''}
                        onChange={(e) => setEditedTask({ ...editedTask, userId: Number(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                ) : (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User size={18} />
                        <span>{users.find(u => u.id === task.userId)?.name || "Unknown User"}</span>
                    </div>
                )}
             </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <AlignLeft size={20} className="mr-2" />
              <h3 className="font-semibold">Description</h3>
            </div>
            {isEditing ? (
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a more detailed description..."
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-gray-700 min-h-[5rem] whitespace-pre-wrap">
                {task.description || "No description provided."}
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div className="text-sm text-gray-500 pt-4 border-t">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
"""

# EXECUTION
# -----------------------------------------------------------------------------
def scaffold():
    print(f"🚀 Starting SAFE updates in: {PROJECT_ROOT}\n")
    
    if not PROJECT_ROOT.exists():
        print(f"❌ Error: Project root not found at {PROJECT_ROOT}")
        return

    for rel_path, content in FILES.items():
        full_path = PROJECT_ROOT / rel_path
        
        # Ensure directory exists
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file
        try:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content.strip() + "\n")
            print(f"✅ Updated/Created: {rel_path}")
        except Exception as e:
            print(f"❌ Failed: {rel_path} - {e}")

    print("\n✨ Updates complete! Your architecture is safe.")

if __name__ == "__main__":
    scaffold()