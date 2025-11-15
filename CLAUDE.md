# CLAUDE.md - AI Assistant Guide

> **Purpose**: This document provides AI assistants with comprehensive context about this codebase's architecture, patterns, conventions, and workflows. Read this FIRST before making any changes.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Workflow](#development-workflow)
4. [Code Patterns](#code-patterns)
5. [Testing Strategy](#testing-strategy)
6. [Common Tasks](#common-tasks)
7. [File Naming Conventions](#file-naming-conventions)
8. [API Endpoints](#api-endpoints)
9. [Critical Design Decisions](#critical-design-decisions)

---

## Project Overview

### Context
- **Course**: Software Engineering, 7th semester (UTFPR)
- **Timeline**: 5-week academic project (MVP completed Week 5/5)
- **Purpose**: Demonstrate Clean Architecture implementation in a full-stack TypeScript application
- **Domain**: Task management system with user authentication

### Key Achievements
- ✅ 10+ functional requirements implemented (exceeded 5 minimum requirement)
- ✅ 100% test coverage in Services layer
- ✅ Clean Architecture with SOLID principles
- ✅ Domain-Driven Design patterns
- ✅ Complete authentication with JWT + bcrypt
- ✅ Role-Based Access Control (admin, gestor, colaborador)
- ✅ Docker Compose with hot-reload for development
- ✅ Advanced features: Projects, Comments, Attachments, Task History
- ✅ File upload/download with multer
- ✅ Kanban board view

### Tech Stack

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL + Sequelize ORM
- JWT authentication (7-day expiry)
- bcrypt password hashing
- Role-Based Access Control (RBAC)
- Multer for file uploads
- Jest + Supertest for testing
- InversifyJS for dependency injection (optional)
- Docker + Docker Compose

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- React Router v6
- Axios (HTTP client)
- React Context API (state management)

---

## Architecture

### Clean Architecture - 4 Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Controllers Layer                       │
│              (API Layer - Express controllers)              │
│         - Validates HTTP input (express-validator)          │
│         - Returns JSON: {message, data} structure           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Services Layer                          │
│              (Business Logic + Use Cases)                   │
│         - CRITICAL: Authorization checks here               │
│         - Orchestrates business workflows                   │
│         - 100% test coverage (MANDATORY)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Repositories Layer                        │
│                  (Data Access Layer)                        │
│         - Abstracts database operations                     │
│         - Uses Mappers for ORM ↔ Domain conversion          │
│         - Returns Domain Entities (not ORM models)          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Models Layer                           │
│                   (Sequelize ORM)                           │
│         - Database schema definitions                       │
│         - Migrations (version-controlled schema)            │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/src/
├── domain/entities/      # Business entities (framework-agnostic)
│   ├── Task.ts          # Task entity with business methods
│   ├── User.ts          # User entity with role-based methods (admin, gestor, colaborador)
│   ├── Project.ts       # Project entity for task grouping
│   ├── TaskHistory.ts   # Task change tracking entity
│   ├── TaskComment.ts   # Task comment entity
│   ├── TaskAttachment.ts # Task file attachment entity
│   └── index.ts
├── usecases/            # Application logic (orchestrates business rules)
│   ├── CreateTaskUseCase.ts
│   ├── UpdateTaskUseCase.ts
│   ├── DeleteTaskUseCase.ts
│   ├── GetTasksUseCase.ts
│   ├── CreateTaskUseCase.test.ts
│   └── index.ts
├── interfaces/          # Contracts (abstractions for DI)
│   ├── ITaskRepository.ts
│   ├── IUserRepository.ts
│   ├── IProjectRepository.ts
│   ├── ITaskHistoryRepository.ts
│   ├── ITaskCommentRepository.ts
│   ├── ITaskAttachmentRepository.ts
│   ├── ITaskService.ts
│   ├── IAuthService.ts
│   └── index.ts
├── services/            # Business logic layer (100% coverage)
│   ├── TaskService.ts
│   ├── TaskService.test.ts
│   ├── AuthService.ts
│   ├── AuthService.test.ts
│   ├── ProjectService.ts
│   ├── TaskCommentService.ts
│   └── TaskAttachmentService.ts
├── repositories/        # Data access implementations
│   ├── TaskRepository.ts
│   ├── UserRepository.ts
│   ├── ProjectRepository.ts
│   ├── TaskHistoryRepository.ts
│   ├── TaskCommentRepository.ts
│   └── TaskAttachmentRepository.ts
├── controllers/         # API layer (HTTP handling)
│   ├── TaskController.ts
│   ├── TaskController.test.ts
│   ├── AuthController.ts
│   ├── ProjectController.ts
│   ├── TaskCommentController.ts
│   └── TaskAttachmentController.ts
├── mappers/            # ORM Model ↔ Domain Entity conversion
│   ├── TaskMapper.ts
│   ├── UserMapper.ts
│   ├── ProjectMapper.ts
│   ├── TaskHistoryMapper.ts
│   ├── TaskCommentMapper.ts
│   └── TaskAttachmentMapper.ts
├── validators/         # Business rule validation
│   ├── TaskValidator.ts
│   ├── TaskValidator.test.ts
│   ├── UserValidator.ts
│   ├── UserValidator.test.ts
│   └── ProjectValidator.ts
├── factories/          # Dependency injection factories (optional)
│   ├── RepositoryFactory.ts
│   └── ServiceFactory.ts
├── container/          # InversifyJS DI container (optional)
│   └── index.ts
├── models/             # Sequelize ORM models
│   ├── Task.ts
│   ├── User.ts
│   ├── Project.ts
│   ├── TaskHistory.ts
│   ├── TaskComment.ts
│   ├── TaskAttachment.ts
│   └── index.ts
├── routes/             # Express route definitions
│   ├── taskRoutes.ts
│   ├── authRoutes.ts
│   ├── authRoutes.test.ts
│   ├── authRoutes.integration.test.ts
│   ├── projectRoutes.ts
│   ├── taskCommentRoutes.ts
│   └── taskAttachmentRoutes.ts
├── middlewares/        # Express middlewares
│   ├── authMiddleware.ts      # JWT authentication
│   ├── roleMiddleware.ts      # Role-based access control
│   ├── uploadMiddleware.ts    # File upload handling (multer)
│   └── errorHandler.ts        # Global error handling
├── errors/             # Custom error classes
│   └── index.ts
├── utils/              # Utilities
│   └── logger.ts       # Logging abstraction
├── config/             # Configuration
│   ├── database.js     # Sequelize config
│   └── app.config.ts   # Centralized env vars
├── types/              # TypeScript type definitions
│   └── express.d.ts    # Express Request extension
├── tests/              # Test setup
│   └── test-setup.ts
├── migrations/         # Database migrations (8 files)
│   ├── 20240101000001-create-users-table.js
│   ├── 20240101000002-create-tasks-table.js
│   ├── 20240102000001-add-role-to-users.js
│   ├── 20240102000002-create-projects-table.js
│   ├── 20240102000003-add-project-id-to-tasks.js
│   ├── 20240102000004-create-task-history-table.js
│   ├── 20240102000005-create-task-comments-table.js
│   └── 20240102000006-create-task-attachments-table.js
├── app.ts              # Express app setup
└── server.ts           # Server entry point

frontend/src/
├── pages/              # Route components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx    # Now includes role selection
│   ├── TasksPage.tsx       # Task list view
│   ├── KanbanPage.tsx      # Kanban board view
│   ├── ProjectsPage.tsx    # Project management
│   └── DashboardPage.tsx
├── components/         # Reusable components
│   ├── Layout.tsx            # Navigation and layout wrapper
│   ├── ProtectedRoute.tsx    # HOC for protected routes
│   └── TaskDetailsModal.tsx  # Modal for task details
├── contexts/           # React contexts
│   └── AuthContext.tsx       # Authentication + user role state
├── services/           # API clients
│   ├── api.ts               # Axios instance with interceptors
│   ├── authService.ts       # Auth API calls
│   ├── projectService.ts    # Project API calls
│   ├── commentService.ts    # Comment API calls
│   └── attachmentService.ts # Attachment API calls
├── App.tsx             # Main app with routing
├── main.tsx            # React entry point
└── index.css           # Global styles
```

### C4 Architecture Diagrams

**Level 1: System Context**
- **User** → uses → **Task Management System** via HTTPS
- Single-user system for personal task management

**Level 2: Container**
- **Frontend SPA** (React/Vite) → makes API calls → **Backend API** (Node.js/Express)
- **Backend API** → reads/writes → **Database** (PostgreSQL)

**Level 3: Component (Backend)**
```
HTTP Request
    ↓
[Middlewares] ← JWT authentication, role-based access, file uploads, error handling
    ↓
[Controllers] ← HTTP input validation (express-validator)
    ↓
[Services] ← CRITICAL: Authorization checks + business logic
    ↓
[Repositories] ← Data access abstraction
    ↓
[Mappers] ← ORM Model ↔ Domain Entity conversion
    ↓
[Models] ← Sequelize ORM
    ↓
PostgreSQL Database
```

Diagrams available: `docs/diagrams/*.png`

---

## Development Workflow

### Prerequisites

**Docker Method (Recommended)**
- Docker Desktop or Docker Engine + Docker Compose
- Git

**Traditional Method**
- Node.js v18+
- PostgreSQL v12+
- npm

### Initial Setup

#### Option 1: Docker Compose (Recommended) ⭐

```bash
# 1. Clone repository
git clone <repo-url>
cd Projeto

# 2. Start all services with hot-reload
docker compose up

# 3. Access the application
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - Hot-reload enabled for both services
```

**What Docker Compose provides**:
- ✅ Automatic dependency installation
- ✅ PostgreSQL database pre-configured
- ✅ Hot-reload for backend (ts-node-dev)
- ✅ Hot-reload for frontend (Vite HMR)
- ✅ Isolated node_modules via named volumes
- ✅ Code sync via bind mounts
- ✅ No local PostgreSQL installation needed

**Docker Compose Commands**:
```bash
# Start services
docker compose up                    # Start and show logs
docker compose up -d                 # Start in detached mode

# Stop services
docker compose down                  # Stop and remove containers
docker compose down -v               # Stop and remove volumes (clean slate)

# View logs
docker compose logs -f               # Follow all logs
docker compose logs -f backend       # Follow backend logs only
docker compose logs -f frontend      # Follow frontend logs only

# Rebuild after dependency changes
docker compose up --build            # Rebuild images and start

# Run commands inside containers
docker compose exec backend npm test              # Run backend tests
docker compose exec backend npm run db:migrate    # Run migrations
docker compose exec frontend npm run build        # Build frontend
```

**Database Connection in Docker**:
- Backend connects to host database via `host.docker.internal`
- Ensure PostgreSQL is running on your host machine
- Database: `task_management_dev`

#### Option 2: Traditional Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd Projeto

# 2. Setup database
psql -U postgres
CREATE DATABASE task_management_dev;
\q

# 3. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:migrate  # Run migrations
npm run dev        # Start dev server (port 3001)

# 4. Frontend setup (new terminal)
cd frontend
npm install
npm run dev        # Start dev server (port 3000)
```

### Environment Variables (.env)

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=task_management_dev

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Server
PORT=3001
NODE_ENV=development
```

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode (during development)
npm run test:watch

# Coverage report (must maintain 100% in services/)
npm run test:coverage
```

### Building for Production

```bash
# Backend
cd backend
npm run build    # TypeScript compilation
npm start        # Run compiled code

# Frontend
cd frontend
npm run build    # Outputs to dist/
```

### Database Migrations

```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run pending migrations
npm run db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo
```

#### Current Database Schema (8 Migrations)

**1. Users Table** (`20240101000001-create-users-table.js`)
- `id` (PK, auto-increment)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255, unique)
- `password_hash` (VARCHAR 255)
- `created_at`, `updated_at` (timestamps)

**2. Tasks Table** (`20240101000002-create-tasks-table.js`)
- `id` (PK, auto-increment)
- `user_id` (FK → Users)
- `title` (VARCHAR 255)
- `description` (TEXT, nullable)
- `status` (ENUM: 'pending', 'completed')
- `priority` (ENUM: 'low', 'medium', 'high', nullable)
- `due_date` (DATE, nullable)
- `created_at`, `updated_at` (timestamps)

**3. Add Role to Users** (`20240102000001-add-role-to-users.js`)
- Adds `role` column (ENUM: 'admin', 'gestor', 'colaborador', default: 'colaborador')

**4. Projects Table** (`20240102000002-create-projects-table.js`)
- `id` (PK, auto-increment)
- `name` (VARCHAR 255)
- `description` (TEXT, nullable)
- `owner_id` (FK → Users)
- `created_at`, `updated_at` (timestamps)

**5. Add Project to Tasks** (`20240102000003-add-project-id-to-tasks.js`)
- Adds `project_id` column (FK → Projects, nullable)
- ON DELETE CASCADE (deleting project deletes tasks)

**6. Task History Table** (`20240102000004-create-task-history-table.js`)
- `id` (PK, auto-increment)
- `task_id` (FK → Tasks)
- `user_id` (FK → Users)
- `previous_status` (VARCHAR 50)
- `new_status` (VARCHAR 50)
- `created_at`, `updated_at` (timestamps)
- Purpose: Audit trail for task status changes

**7. Task Comments Table** (`20240102000005-create-task-comments-table.js`)
- `id` (PK, auto-increment)
- `task_id` (FK → Tasks, ON DELETE CASCADE)
- `user_id` (FK → Users)
- `content` (TEXT)
- `created_at`, `updated_at` (timestamps)

**8. Task Attachments Table** (`20240102000006-create-task-attachments-table.js`)
- `id` (PK, auto-increment)
- `task_id` (FK → Tasks, ON DELETE CASCADE)
- `file_name` (VARCHAR 255)
- `file_path` (VARCHAR 500)
- `uploaded_at` (timestamp)

**Entity Relationships**:
```
User (1) ─┬─ (N) Task
          ├─ (N) Project (as owner)
          ├─ (N) TaskComment
          └─ (N) TaskHistory

Project (1) ── (N) Task

Task (1) ─┬─ (N) TaskComment
          ├─ (N) TaskAttachment
          └─ (N) TaskHistory
```

---

## Code Patterns

### 1. Domain Entity Pattern

**Purpose**: Framework-agnostic business entities with behavior

#### User Entity with Role-Based Access Control

**Example**: `backend/src/domain/entities/User.ts`

```typescript
export type UserRole = 'admin' | 'gestor' | 'colaborador';

export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Role-based access control methods
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isGestor(): boolean {
    return this.role === 'gestor';
  }

  isColaborador(): boolean {
    return this.role === 'colaborador';
  }

  // Permission checks
  canCreateProjects(): boolean {
    return this.role === 'admin' || this.role === 'gestor';
  }

  canManageUsers(): boolean {
    return this.role === 'admin';
  }

  canDeleteTasks(): boolean {
    return this.role === 'admin' || this.role === 'gestor';
  }

  // Security: Never expose password hash
  toSafeObject(): Omit<User, 'passwordHash'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    } as Omit<User, 'passwordHash'>;
  }
}
```

**Key Principles**:
- Three roles: `admin`, `gestor`, `colaborador`
- Permission methods for fine-grained access control
- `toSafeObject()` prevents password hash exposure in API responses
- Role validation happens in domain layer

**Usage in Services**:
```typescript
// Check permissions before operations
if (!user.canCreateProjects()) {
  throw new AuthorizationError('Only admins and gestors can create projects');
}

// Return safe user object in responses
return user.toSafeObject();
```

---

#### Task Entity

**Example**: `backend/src/domain/entities/Task.ts`

```typescript
export class Task {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: 'pending' | 'completed',
    public readonly priority: 'low' | 'medium' | 'high' | null,
    public readonly dueDate: Date | null,
    public readonly projectId: number | null,  // NEW: Task can belong to project
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Business methods (NOT data access)
  isOwnedBy(userId: number): boolean {
    return this.userId === userId;
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return this.dueDate < new Date() && !this.isCompleted();
  }

  getPriorityValue(): number {
    // For sorting: high=3, medium=2, low=1, null=0
    switch (this.priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
}
```

**Key Principles**:
- Immutable (readonly properties)
- No dependencies on frameworks/ORMs
- Contains business logic methods
- Used across all layers

---

### 2. Use Case Pattern

**Purpose**: Encapsulates single application workflow

**Example**: `backend/src/usecases/CreateTaskUseCase.ts`

```typescript
export class CreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,  // Interface, not concrete class
    private logger: ILogger
  ) {}

  async execute(userId: number, input: CreateTaskInput): Promise<Task> {
    // 1. Log operation
    this.logger.info(`Creating task for user ${userId}`, { title: input.title });

    // 2. Validate input
    const validation = TaskValidator.validateCreate(input);
    if (!validation.isValid) {
      this.logger.warn('Task validation failed', { errors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // 3. Additional business rules
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    // 4. Execute operation via repository
    const task = await this.taskRepository.create({
      user_id: userId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      due_date: input.due_date,
      status: 'pending',
    });

    // 5. Log success
    this.logger.info(`Task ${task.id} created successfully`);

    return task;
  }
}
```

**Key Principles**:
- Single responsibility (one workflow)
- Depends on interfaces (DI)
- Validates before executing
- Logs operations
- Returns domain entities

---

### 3. Repository Pattern

**Purpose**: Abstracts data access, returns domain entities

**Example**: `backend/src/repositories/TaskRepository.ts`

```typescript
class TaskRepository {
  async findById(id: number): Promise<Task | null> {
    const taskModel = await TaskModel.findByPk(id);
    return taskModel ? TaskMapper.toDomain(taskModel) : null;
    //                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                 CRITICAL: Always return domain entities
  }

  async findAllByUserId(userId: number): Promise<Task[]> {
    const taskModels = await TaskModel.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
    return TaskMapper.toDomainList(taskModels);
  }

  async create(taskData: CreateTaskDTO): Promise<Task> {
    const taskModel = await TaskModel.create(taskData);
    return TaskMapper.toDomain(taskModel);
  }

  async update(id: number, taskData: UpdateTaskDTO): Promise<Task | null> {
    const taskModel = await TaskModel.findByPk(id);
    if (!taskModel) return null;

    await taskModel.update(taskData);
    return TaskMapper.toDomain(taskModel);
  }
}
```

**Key Principles**:
- Uses mappers to convert ORM models → domain entities
- Never exposes ORM models to upper layers
- Handles database errors
- Returns `null` for not found (don't throw here)

---

### 4. Mapper Pattern

**Purpose**: Isolates ORM from domain layer

**Example**: `backend/src/mappers/TaskMapper.ts`

```typescript
export class TaskMapper {
  // ORM Model → Domain Entity
  static toDomain(model: TaskModel): Task {
    return new Task(
      model.id,
      model.user_id,
      model.title,
      model.description,
      model.status,
      model.priority,
      model.due_date,
      model.created_at,
      model.updated_at
    );
  }

  // Domain Entity → ORM Model attributes
  static toModel(entity: Task): TaskAttributes {
    return {
      id: entity.id,
      user_id: entity.userId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      due_date: entity.dueDate,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  // Array conversion
  static toDomainList(models: TaskModel[]): Task[] {
    return models.map(model => this.toDomain(model));
  }
}
```

---

### 5. Service Layer Pattern

**Purpose**: Business logic + authorization enforcement

**Example**: `backend/src/services/TaskService.ts`

```typescript
class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async getTasks(userId: number): Promise<Task[]> {
    return await this.taskRepository.findAllByUserId(userId);
  }

  async updateTask(
    userId: number,
    taskId: number,
    taskData: UpdateTaskDTO
  ): Promise<Task> {
    // 1. Fetch existing task
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    // 2. CRITICAL: Authorization check at SERVICE layer
    //    (Don't rely only on middleware - defense in depth)
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to modify this task');
    }

    // 3. Execute operation
    const updatedTask = await this.taskRepository.update(taskId, taskData);
    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return updatedTask;
  }
}
```

**Key Principles**:
- **ALWAYS check authorization in services** (critical security requirement)
- Use domain entity methods (e.g., `task.isOwnedBy()`)
- Throw custom error classes
- Keep logic testable (no HTTP concerns)

---

### 6. Controller Pattern

**Purpose**: HTTP layer - validate input, call services, return JSON

**Example**: `backend/src/controllers/TaskController.ts`

```typescript
class TaskController {
  constructor(private taskService: TaskService) {}

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate HTTP input (express-validator)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // 2. Extract data from request
      const userId = req.user!.id;  // Set by authMiddleware
      const { title, description, priority, due_date } = req.body;

      // 3. Call service layer
      const task = await this.taskService.createTask(userId, {
        title,
        description,
        priority,
        due_date: due_date ? new Date(due_date) : undefined,
      });

      // 4. Return standardized JSON response
      res.status(201).json({
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);  // Pass to error handling middleware
    }
  };
}
```

**Response Format** (MANDATORY):
```json
{
  "message": "Human-readable message",
  "data": { /* entity or array */ }
}
```

**Key Principles**:
- Arrow functions for binding `this`
- Always use `try/catch` + `next(error)`
- Validate input with express-validator
- Return consistent JSON structure
- No business logic here

---

### 7. Validator Pattern

**Purpose**: Validate business rules before operations

**Example**: `backend/src/validators/TaskValidator.ts`

```typescript
export class TaskValidator {
  static validateCreate(data: any): ValidationResult {
    const errors: string[] = [];

    // Title validation
    if (!data.title) {
      errors.push('Title is required');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.length > 255) {
      errors.push('Title is too long (maximum 255 characters)');
    }

    // Priority validation
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('Priority must be one of: low, medium, high');
    }

    // Due date validation
    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

**Usage in Use Cases**:
```typescript
const validation = TaskValidator.validateCreate(input);
if (!validation.isValid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}
```

---

### 8. Error Handling Pattern

**Custom Error Classes**: `backend/src/errors/index.ts`

```typescript
export class UserNotFoundError extends Error {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'AuthorizationError';
  }
}
```

**Error Handler Middleware**: `backend/src/middlewares/errorHandler.ts`

Maps error types to HTTP status codes:
- `UserNotFoundError` → 404
- `AuthorizationError` → 403
- `ValidationError` → 400
- `UserAlreadyExistsError` → 409
- Default → 500

---

## Testing Strategy

### Current Coverage
- **Services Layer**: 100% coverage (MANDATORY)
- **Use Cases**: Tested with mocked dependencies
- **Controllers**: Integration tests with Supertest
- **Validators**: Unit tested

### Test Structure

**Service Test Example**: `backend/src/services/TaskService.test.ts`

```typescript
describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    // Create mock repository
    mockTaskRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      // ... other methods
    } as any;

    taskService = new TaskService(mockTaskRepository);
  });

  describe('updateTask', () => {
    it('should update task when user owns it', async () => {
      // Arrange
      const mockTask = new Task(1, 100, 'Test', null, 'pending', null, null, new Date(), new Date());
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue({ ...mockTask, title: 'Updated' });

      // Act
      const result = await taskService.updateTask(100, 1, { title: 'Updated' });

      // Assert
      expect(result.title).toBe('Updated');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw AuthorizationError when user does not own task', async () => {
      // Arrange
      const mockTask = new Task(1, 100, 'Test', null, 'pending', null, null, new Date(), new Date());
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(
        taskService.updateTask(999, 1, { title: 'Updated' })
      ).rejects.toThrow(AuthorizationError);
    });
  });
});
```

### Maintaining 100% Coverage

**Before committing code**:

```bash
npm run test:coverage
```

**Requirements**:
- Services: 100% coverage (lines, branches, functions)
- Use Cases: 100% coverage
- Validators: 100% coverage

**How to achieve**:
1. Test happy paths
2. Test error cases (not found, unauthorized, validation failures)
3. Test edge cases (empty strings, null values, etc.)
4. Mock all dependencies (repositories, loggers)

### Test Files Location
- Place tests next to source files: `TaskService.test.ts` next to `TaskService.ts`
- Integration tests: `src/routes/*.integration.test.ts`
- Test setup: `src/tests/test-setup.ts`

---

## Common Tasks

### Task 1: Add New Feature (e.g., "Task Tags")

**Step 1: Domain Entity**

```typescript
// backend/src/domain/entities/Tag.ts
export class Tag {
  constructor(
    public readonly id: number,
    public readonly taskId: number,
    public readonly name: string,
    public readonly color: string,
    public readonly createdAt: Date
  ) {}

  // Business methods
  isValidColor(): boolean {
    return /^#[0-9A-F]{6}$/i.test(this.color);
  }
}
```

**Step 2: ORM Model**

```typescript
// backend/src/models/Tag.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Tag extends Model {
  public id!: number;
  public task_id!: number;
  public name!: string;
  public color!: string;
  // ... timestamps
}

Tag.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Tasks', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
  },
}, { sequelize, modelName: 'Tag' });

export default Tag;
```

**Step 3: Create Migration**

```bash
npx sequelize-cli migration:generate --name create-tags-table
```

```javascript
// migrations/XXXXXX-create-tags-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tags', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Tasks', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Tags');
  },
};
```

**Step 4: Mapper**

```typescript
// backend/src/mappers/TagMapper.ts
import { Tag } from '../domain/entities/Tag';
import TagModel from '../models/Tag';

export class TagMapper {
  static toDomain(model: TagModel): Tag {
    return new Tag(
      model.id,
      model.task_id,
      model.name,
      model.color,
      model.created_at
    );
  }

  static toDomainList(models: TagModel[]): Tag[] {
    return models.map(m => this.toDomain(m));
  }
}
```

**Step 5: Repository Interface**

```typescript
// backend/src/interfaces/ITagRepository.ts
import { Tag } from '../domain/entities/Tag';

export interface CreateTagDTO {
  task_id: number;
  name: string;
  color: string;
}

export interface ITagRepository {
  findByTaskId(taskId: number): Promise<Tag[]>;
  create(data: CreateTagDTO): Promise<Tag>;
  delete(id: number): Promise<boolean>;
}
```

**Step 6: Repository Implementation**

```typescript
// backend/src/repositories/TagRepository.ts
import TagModel from '../models/Tag';
import { Tag } from '../domain/entities/Tag';
import { TagMapper } from '../mappers/TagMapper';
import { ITagRepository, CreateTagDTO } from '../interfaces/ITagRepository';

export class TagRepository implements ITagRepository {
  async findByTaskId(taskId: number): Promise<Tag[]> {
    const tags = await TagModel.findAll({ where: { task_id: taskId } });
    return TagMapper.toDomainList(tags);
  }

  async create(data: CreateTagDTO): Promise<Tag> {
    const tag = await TagModel.create(data);
    return TagMapper.toDomain(tag);
  }

  async delete(id: number): Promise<boolean> {
    const result = await TagModel.destroy({ where: { id } });
    return result > 0;
  }
}
```

**Step 7: Validator**

```typescript
// backend/src/validators/TagValidator.ts
export class TagValidator {
  static validateCreate(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Tag name is required');
    }

    if (data.name && data.name.length > 50) {
      errors.push('Tag name is too long (maximum 50 characters)');
    }

    if (!data.color || !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push('Color must be a valid hex color (e.g., #FF5733)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

**Step 8: Use Case**

```typescript
// backend/src/usecases/CreateTagUseCase.ts
import { ITagRepository } from '../interfaces/ITagRepository';
import { ITaskRepository } from '../interfaces/ITaskRepository';
import { ILogger } from '../utils/logger';
import { Tag } from '../domain/entities/Tag';
import { TagValidator } from '../validators/TagValidator';
import { AuthorizationError, UserNotFoundError } from '../errors';

export class CreateTagUseCase {
  constructor(
    private tagRepository: ITagRepository,
    private taskRepository: ITaskRepository,
    private logger: ILogger
  ) {}

  async execute(userId: number, taskId: number, input: { name: string; color: string }): Promise<Tag> {
    // 1. Validate input
    const validation = TagValidator.validateCreate(input);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // 2. Verify task exists and user owns it
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new UserNotFoundError('Task not found');
    }

    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('You are not authorized to add tags to this task');
    }

    // 3. Create tag
    const tag = await this.tagRepository.create({
      task_id: taskId,
      name: input.name,
      color: input.color,
    });

    this.logger.info(`Tag created for task ${taskId}`);
    return tag;
  }
}
```

**Step 9: Service**

```typescript
// backend/src/services/TagService.ts (or extend TaskService)
import { TagRepository } from '../repositories/TagRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { Tag } from '../domain/entities/Tag';
import { AuthorizationError, UserNotFoundError } from '../errors';

export class TagService {
  constructor(
    private tagRepository: TagRepository,
    private taskRepository: TaskRepository
  ) {}

  async createTag(userId: number, taskId: number, data: { name: string; color: string }): Promise<Tag> {
    // Authorization check
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new UserNotFoundError('Task not found');
    if (!task.isOwnedBy(userId)) throw new AuthorizationError('Unauthorized');

    return await this.tagRepository.create({
      task_id: taskId,
      name: data.name,
      color: data.color,
    });
  }

  async getTaskTags(userId: number, taskId: number): Promise<Tag[]> {
    // Authorization check
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new UserNotFoundError('Task not found');
    if (!task.isOwnedBy(userId)) throw new AuthorizationError('Unauthorized');

    return await this.tagRepository.findByTaskId(taskId);
  }
}
```

**Step 10: Controller**

```typescript
// backend/src/controllers/TagController.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import TagService from '../services/TagService';

export class TagController {
  constructor(private tagService: TagService) {}

  createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user!.id;
      const taskId = parseInt(req.params.taskId);
      const { name, color } = req.body;

      const tag = await this.tagService.createTag(userId, taskId, { name, color });

      res.status(201).json({
        message: 'Tag created successfully',
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  };

  getTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const taskId = parseInt(req.params.taskId);

      const tags = await this.tagService.getTaskTags(userId, taskId);

      res.status(200).json({
        message: 'Tags retrieved successfully',
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  };
}
```

**Step 11: Routes**

```typescript
// backend/src/routes/tagRoutes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import TagController from '../controllers/TagController';
import TagService from '../services/TagService';
import TagRepository from '../repositories/TagRepository';
import TaskRepository from '../repositories/TaskRepository';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

const tagRepository = new TagRepository();
const taskRepository = new TaskRepository();
const tagService = new TagService(tagRepository, taskRepository);
const tagController = new TagController(tagService);

router.use(authMiddleware);

router.post(
  '/tasks/:taskId/tags',
  [
    body('name').trim().notEmpty().isLength({ max: 50 }),
    body('color').matches(/^#[0-9A-F]{6}$/i),
  ],
  tagController.createTag
);

router.get('/tasks/:taskId/tags', tagController.getTags);

export default router;
```

**Step 12: Wire up in app.ts**

```typescript
// backend/src/app.ts
import tagRoutes from './routes/tagRoutes';

app.use('/api', tagRoutes);
```

**Step 13: Write Tests**

```typescript
// backend/src/services/TagService.test.ts
describe('TagService', () => {
  let tagService: TagService;
  let mockTagRepository: jest.Mocked<TagRepository>;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTagRepository = {
      create: jest.fn(),
      findByTaskId: jest.fn(),
    } as any;

    mockTaskRepository = {
      findById: jest.fn(),
    } as any;

    tagService = new TagService(mockTagRepository, mockTaskRepository);
  });

  it('should create tag when user owns task', async () => {
    const mockTask = new Task(1, 100, 'Test', null, 'pending', null, null, new Date(), new Date());
    mockTaskRepository.findById.mockResolvedValue(mockTask);

    const mockTag = new Tag(1, 1, 'urgent', '#FF0000', new Date());
    mockTagRepository.create.mockResolvedValue(mockTag);

    const result = await tagService.createTag(100, 1, { name: 'urgent', color: '#FF0000' });

    expect(result.name).toBe('urgent');
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw AuthorizationError when user does not own task', async () => {
    const mockTask = new Task(1, 100, 'Test', null, 'pending', null, null, new Date(), new Date());
    mockTaskRepository.findById.mockResolvedValue(mockTask);

    await expect(
      tagService.createTag(999, 1, { name: 'urgent', color: '#FF0000' })
    ).rejects.toThrow(AuthorizationError);
  });
});
```

**Step 14: Run Migration & Tests**

```bash
npm run db:migrate
npm test
npm run test:coverage  # Verify 100% coverage maintained
```

---

### Task 2: Fix a Bug

**Example**: "Task update endpoint returns 500 error"

**Step 1: Reproduce the bug**
- Write a failing test first (TDD approach)
- Run existing tests to see if already covered

**Step 2: Identify layer**
- Check logs/error message
- Trace through layers: Controller → Service → Repository

**Step 3: Fix in correct layer**
- Business logic bug? → Fix in Service
- Validation bug? → Fix in Validator
- Data access bug? → Fix in Repository
- HTTP handling bug? → Fix in Controller

**Step 4: Update tests**
- Ensure new test passes
- Verify all existing tests still pass
- Check coverage remains 100%

**Step 5: Commit**
```bash
git add .
git commit -m "fix: Handle null description in task update (closes #123)"
```

---

### Task 3: Refactor Code

**Example**: "Extract common authorization logic"

**Before** (duplicated in every service method):
```typescript
async updateTask(userId: number, taskId: number, data: UpdateTaskDTO): Promise<Task> {
  const task = await this.taskRepository.findById(taskId);
  if (!task) throw new UserNotFoundError('Task not found');
  if (!task.isOwnedBy(userId)) throw new AuthorizationError('Unauthorized');

  // ... update logic
}
```

**After** (extract to private method):
```typescript
private async authorizeTaskAccess(userId: number, taskId: number): Promise<Task> {
  const task = await this.taskRepository.findById(taskId);
  if (!task) throw new UserNotFoundError('Task not found');
  if (!task.isOwnedBy(userId)) throw new AuthorizationError('Unauthorized');
  return task;
}

async updateTask(userId: number, taskId: number, data: UpdateTaskDTO): Promise<Task> {
  const task = await this.authorizeTaskAccess(userId, taskId);
  // ... update logic
}

async deleteTask(userId: number, taskId: number): Promise<boolean> {
  await this.authorizeTaskAccess(userId, taskId);
  // ... delete logic
}
```

**Critical**: After refactoring, run tests to ensure behavior unchanged!

---

## File Naming Conventions

### Backend

**Directory Names**: `camelCase`
- ✅ `usecases/`, `middlewares/`, `validators/`
- ❌ `UseCases/`, `Middlewares/`

**File Names**: `PascalCase` for classes, `camelCase` for modules
- Classes: `TaskService.ts`, `CreateTaskUseCase.ts`, `TaskMapper.ts`
- Modules: `authMiddleware.ts`, `errorHandler.ts`, `logger.ts`
- Config: `app.config.ts`, `database.js`

**Test Files**: Same as source file + `.test.ts`
- `TaskService.test.ts`
- `CreateTaskUseCase.test.ts`

**Class Names**: `PascalCase`
- `class TaskService {}`
- `export class CreateTaskUseCase {}`

**Interface Names**: `PascalCase` with `I` prefix
- `interface ITaskRepository {}`
- `interface ILogger {}`

**Method Names**: `camelCase`
- `async getTasks(userId: number): Promise<Task[]> {}`
- `isOwnedBy(userId: number): boolean {}`

**Variable Names**: `camelCase`
- `const taskRepository = new TaskRepository();`
- `const userId = req.user!.id;`

**Constants**: `SCREAMING_SNAKE_CASE`
- `const JWT_EXPIRY = '7d';`
- `const MAX_TITLE_LENGTH = 255;`

**DTOs (Data Transfer Objects)**: `PascalCase` + `DTO` suffix
- `interface CreateTaskDTO {}`
- `interface UpdateTaskDTO {}`

### Frontend

**Component Files**: `PascalCase.tsx`
- `LoginPage.tsx`, `DashboardPage.tsx`

**Non-component Files**: `camelCase.ts`
- `authService.ts`, `api.ts`

**Component Names**: `PascalCase`
- `export const LoginPage = () => {}`

---

## API Endpoints

### Authentication Endpoints

**Base URL**: `http://localhost:3001/api/auth`

#### POST /api/auth/register
Register a new user account.

**Auth**: None required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "colaborador"
}
```

**Validation**:
- `name`: Required, 2-255 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `role`: Required, one of: `"admin"`, `"gestor"`, `"colaborador"`

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses**:
- 400: Validation errors
- 409: Email already exists

---

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Auth**: None required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses**:
- 400: Validation errors
- 404: User not found
- 401: Invalid password

---

### Task Endpoints

**Base URL**: `http://localhost:3001/api/tasks`

**Authentication**: All task endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

#### GET /api/tasks
Retrieve all tasks for authenticated user.

**Auth**: Required (JWT)

**Query Parameters**: None (future: pagination, filtering)

**Success Response** (200):
```json
{
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive README and API docs",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "userId": 1,
      "title": "Review pull requests",
      "description": null,
      "status": "completed",
      "priority": "medium",
      "dueDate": null,
      "createdAt": "2024-01-14T09:00:00.000Z",
      "updatedAt": "2024-01-15T14:20:00.000Z"
    }
  ]
}
```

**Error Responses**:
- 401: Missing or invalid JWT token

---

#### POST /api/tasks
Create a new task for authenticated user.

**Auth**: Required (JWT)

**Request Body**:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59.000Z"
}
```

**Validation**:
- `title`: Required, 1-255 characters
- `description`: Optional, max 5000 characters
- `priority`: Optional, one of: `"low"`, `"medium"`, `"high"`
- `due_date`: Optional, valid ISO 8601 date

**Success Response** (201):
```json
{
  "message": "Task created successfully",
  "data": {
    "id": 3,
    "userId": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-16T11:00:00.000Z",
    "updatedAt": "2024-01-16T11:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Validation errors
- 401: Missing or invalid JWT token

---

#### PUT /api/tasks/:id
Update an existing task (full update).

**Auth**: Required (JWT + task ownership)

**URL Parameters**:
- `id`: Task ID (integer)

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "low",
  "due_date": "2024-12-25T23:59:59.000Z"
}
```

**Validation**:
- All fields optional
- `title`: 1-255 characters if provided
- `description`: Max 5000 characters if provided
- `status`: One of `"pending"`, `"completed"`
- `priority`: One of `"low"`, `"medium"`, `"high"`
- `due_date`: Valid ISO 8601 date if provided

**Success Response** (200):
```json
{
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Updated title",
    "description": "Updated description",
    "status": "completed",
    "priority": "low",
    "dueDate": "2024-12-25T23:59:59.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T12:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Validation errors or invalid task ID
- 401: Missing or invalid JWT token
- 403: Task belongs to another user (AuthorizationError)
- 404: Task not found

---

#### PATCH /api/tasks/:id/complete
Mark a task as completed (partial update).

**Auth**: Required (JWT + task ownership)

**URL Parameters**:
- `id`: Task ID (integer)

**Request Body**: None (status is automatically set to `"completed"`)

**Success Response** (200):
```json
{
  "message": "Task marked as completed",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "status": "completed",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T13:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Invalid task ID
- 401: Missing or invalid JWT token
- 403: Task belongs to another user
- 404: Task not found

---

#### DELETE /api/tasks/:id
Delete a task permanently.

**Auth**: Required (JWT + task ownership)

**URL Parameters**:
- `id`: Task ID (integer)

**Success Response** (200):
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses**:
- 400: Invalid task ID
- 401: Missing or invalid JWT token
- 403: Task belongs to another user
- 404: Task not found

---

### Project Endpoints

**Base URL**: `http://localhost:3001/api/projects`

**Authentication**: All project endpoints require JWT token + appropriate role permissions

---

#### GET /api/projects
Retrieve all projects (admin and gestor can see all; colaborador sees only assigned).

**Auth**: Required (JWT)

**Success Response** (200):
```json
{
  "message": "Projects retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "ownerId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### POST /api/projects
Create a new project (admin and gestor only).

**Auth**: Required (JWT + admin or gestor role)

**Request Body**:
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website"
}
```

**Validation**:
- `name`: Required, 1-255 characters
- `description`: Optional, max 5000 characters

**Success Response** (201):
```json
{
  "message": "Project created successfully",
  "data": {
    "id": 1,
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "ownerId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- 403: User does not have permission (colaborador role)

---

#### PUT /api/projects/:id
Update a project (admin and project owner only).

**Auth**: Required (JWT + admin or project owner)

**Success Response** (200):
```json
{
  "message": "Project updated successfully",
  "data": { /* updated project */ }
}
```

---

#### DELETE /api/projects/:id
Delete a project (admin and project owner only).

**Auth**: Required (JWT + admin or project owner)

**Success Response** (200):
```json
{
  "message": "Project deleted successfully"
}
```

---

### Task Comment Endpoints

**Base URL**: `http://localhost:3001/api/tasks/:taskId/comments`

---

#### GET /api/tasks/:taskId/comments
Retrieve all comments for a task.

**Auth**: Required (JWT)

**Success Response** (200):
```json
{
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "userId": 2,
      "content": "I'll start working on this tomorrow",
      "createdAt": "2024-01-15T14:30:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

---

#### POST /api/tasks/:taskId/comments
Add a comment to a task.

**Auth**: Required (JWT)

**Request Body**:
```json
{
  "content": "I'll start working on this tomorrow"
}
```

**Validation**:
- `content`: Required, 1-5000 characters

**Success Response** (201):
```json
{
  "message": "Comment added successfully",
  "data": {
    "id": 1,
    "taskId": 1,
    "userId": 2,
    "content": "I'll start working on this tomorrow",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

#### DELETE /api/tasks/:taskId/comments/:commentId
Delete a comment (comment owner or admin only).

**Auth**: Required (JWT + comment owner or admin)

**Success Response** (200):
```json
{
  "message": "Comment deleted successfully"
}
```

---

### Task Attachment Endpoints

**Base URL**: `http://localhost:3001/api/tasks/:taskId/attachments`

---

#### GET /api/tasks/:taskId/attachments
Retrieve all attachments for a task.

**Auth**: Required (JWT)

**Success Response** (200):
```json
{
  "message": "Attachments retrieved successfully",
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "fileName": "design-mockup.pdf",
      "filePath": "uploads/1234567890-design-mockup.pdf",
      "uploadedAt": "2024-01-15T15:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/tasks/:taskId/attachments
Upload a file attachment to a task.

**Auth**: Required (JWT)

**Request**: `multipart/form-data`

**Form Data**:
- `file`: File to upload (max 10MB)

**Supported File Types**:
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`, `.txt`
- Archives: `.zip`, `.rar`

**Success Response** (201):
```json
{
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "taskId": 1,
    "fileName": "design-mockup.pdf",
    "filePath": "uploads/1234567890-design-mockup.pdf",
    "uploadedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: No file provided or invalid file type
- 413: File too large (>10MB)

---

#### GET /api/tasks/:taskId/attachments/:attachmentId/download
Download a file attachment.

**Auth**: Required (JWT)

**Success Response** (200):
- Content-Type: Based on file type
- Content-Disposition: `attachment; filename="original-filename.ext"`
- Body: File binary data

**Error Responses**:
- 404: File not found

---

#### DELETE /api/tasks/:taskId/attachments/:attachmentId
Delete an attachment (uploader or admin only).

**Auth**: Required (JWT + uploader or admin)

**Success Response** (200):
```json
{
  "message": "Attachment deleted successfully"
}
```

---

### Response Format (ALL Endpoints)

**Success**:
```json
{
  "message": "Human-readable success message",
  "data": { /* object or array */ }
}
```

**Error**:
```json
{
  "error": "Error message",
  "details": [/* optional validation errors */]
}
```

---

## Critical Design Decisions

### 1. Authorization at Service Layer (Security)

**Why**: Defense in depth. Don't rely solely on middleware.

**Where**: `backend/src/services/TaskService.ts:69-72, 102-104, 132-134`

**Pattern**:
```typescript
// ALWAYS fetch entity first
const task = await this.taskRepository.findById(taskId);
if (!task) throw new UserNotFoundError('Task not found');

// ALWAYS check ownership before modify/delete operations
if (!task.isOwnedBy(userId)) {
  throw new AuthorizationError('You are not authorized...');
}

// THEN perform operation
await this.taskRepository.update(taskId, data);
```

**Critical**: Middleware can be bypassed or misconfigured. Service-level checks are the last line of defense.

---

### 2. Domain Entities Contain Business Logic

**Why**: Keep business rules close to data, independent of frameworks.

**Example**: `backend/src/domain/entities/Task.ts:19-57`

```typescript
export class Task {
  // Business logic methods
  isOwnedBy(userId: number): boolean {
    return this.userId === userId;
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return this.dueDate < new Date() && !this.isCompleted();
  }
}
```

**Benefits**:
- Testable without database
- Reusable across layers
- Framework-agnostic

---

### 3. Mappers Isolate ORM from Domain

**Why**: Domain layer should not depend on Sequelize (or any ORM).

**Pattern**: `backend/src/mappers/TaskMapper.ts:26-38`

```typescript
// Repositories NEVER return ORM models directly
async findById(id: number): Promise<Task | null> {
  const taskModel = await TaskModel.findByPk(id);
  return taskModel ? TaskMapper.toDomain(taskModel) : null;
  //                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                 ALWAYS convert to domain entity
}
```

**Benefits**:
- Can swap ORM without changing domain/service layers
- Domain entities have clean API
- No ORM magic/proxies in business logic

---

### 4. Use Cases Validate Before Executing

**Why**: Separate validation from business logic, fail fast.

**Pattern**: `backend/src/usecases/CreateTaskUseCase.ts:36-40`

```typescript
async execute(userId: number, input: CreateTaskInput): Promise<Task> {
  // 1. Validate input FIRST
  const validation = TaskValidator.validateCreate(input);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // 2. Then execute business logic
  const task = await this.taskRepository.create({...});
  return task;
}
```

---

### 5. Custom Error Classes for Clear Error Handling

**Why**: Type-safe error handling, clear HTTP status mapping.

**Pattern**: `backend/src/errors/index.ts`

```typescript
// Services throw typed errors
if (!task.isOwnedBy(userId)) {
  throw new AuthorizationError('Unauthorized');
}

// Error middleware maps to HTTP status
if (error instanceof AuthorizationError) {
  return res.status(403).json({ error: error.message });
}
```

**Available Errors**:
- `UserAlreadyExistsError` → 409
- `UserNotFoundError` → 404
- `InvalidPasswordError` → 401
- `AuthorizationError` → 403
- `ValidationError` → 400

---

### 6. JWT Tokens in localStorage (Frontend)

**Location**: `frontend/src/contexts/AuthContext.tsx`

**Pattern**:
```typescript
// Store token on login
localStorage.setItem('token', token);

// Add to all requests via axios interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Considerations**:
- ✅ Simple, works for SPA
- ❌ Vulnerable to XSS (mitigated by React's automatic escaping)
- Alternative: httpOnly cookies (more secure, requires CORS setup)

---

### 7. Bcrypt Hashing at Model Level

**Location**: `backend/src/models/User.ts` (beforeCreate hook)

**Pattern**:
```typescript
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password_hash = await bcrypt.hash(user.password_hash, salt);
});
```

**Why**:
- Automatic hashing (can't forget)
- Service layer just passes plain password
- Consistent across registration flows

---

### 8. Pagination Support in Repositories

**Location**: `backend/src/repositories/TaskRepository.ts:98-121`

**Pattern**:
```typescript
async findAllByUserIdPaginated(
  userId: number,
  options: PaginationOptions
): Promise<PaginatedResult<Task>> {
  const offset = (options.page - 1) * options.limit;
  const { rows, count } = await TaskModel.findAndCountAll({
    where: { user_id: userId },
    limit: options.limit,
    offset,
    order: [[options.orderBy || 'created_at', options.order || 'DESC']],
  });

  return {
    data: TaskMapper.toDomainList(rows),
    total: count,
    page: options.page,
    totalPages: Math.ceil(count / options.limit),
  };
}
```

**Usage**:
```typescript
const result = await taskRepository.findAllByUserIdPaginated(userId, {
  page: 1,
  limit: 20,
  orderBy: 'created_at',
  order: 'DESC',
});
```

---

### 9. Centralized Configuration

**Location**: `backend/src/config/app.config.ts`

**Pattern**:
```typescript
export const AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    // ...
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d',
  },
};
```

**Benefits**:
- Single source of truth for env vars
- Type-safe access
- Easy to mock in tests

---

### 10. Role-Based Access Control (RBAC)

**Why**: Fine-grained permissions for different user types.

**Roles**:
- **admin**: Full system access (manage users, projects, all tasks)
- **gestor**: Project management (create projects, manage team tasks)
- **colaborador**: Basic access (manage own tasks only)

**Implementation Pattern**: `backend/src/domain/entities/User.ts`

```typescript
export type UserRole = 'admin' | 'gestor' | 'colaborador';

export class User {
  // Permission checks in domain entity
  canCreateProjects(): boolean {
    return this.role === 'admin' || this.role === 'gestor';
  }

  canManageUsers(): boolean {
    return this.role === 'admin';
  }

  canDeleteTasks(): boolean {
    return this.role === 'admin' || this.role === 'gestor';
  }
}
```

**Middleware Enforcement**: `backend/src/middlewares/roleMiddleware.ts`

```typescript
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

**Usage in Routes**:
```typescript
// Only admin and gestor can create projects
router.post('/projects',
  authMiddleware,
  requireRole('admin', 'gestor'),
  projectController.createProject
);

// Only admin can manage users
router.delete('/users/:id',
  authMiddleware,
  requireRole('admin'),
  userController.deleteUser
);
```

**Benefits**:
- Clear permission hierarchy
- Declarative route protection
- Domain-level permission checks
- Easy to extend with new roles

---

### 11. Automatic Task History Tracking

**Why**: Audit trail for task changes.

**Pattern**: Sequelize model hooks automatically create history records.

**Location**: `backend/src/models/Task.ts`

```typescript
Task.afterUpdate(async (task) => {
  // Automatically log status changes
  if (task.changed('status')) {
    await TaskHistory.create({
      task_id: task.id,
      user_id: task.user_id,
      previous_status: task._previousDataValues.status,
      new_status: task.status,
    });
  }
});
```

**Benefits**:
- Transparent tracking (no manual logging in services)
- Complete audit trail
- Historical reporting capabilities

---

### 12. File Upload with Multer

**Why**: Secure file handling with validation.

**Location**: `backend/src/middlewares/uploadMiddleware.ts`

```typescript
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});
```

**Usage**:
```typescript
router.post('/tasks/:taskId/attachments',
  authMiddleware,
  upload.single('file'),
  attachmentController.uploadFile
);
```

**Benefits**:
- File type validation
- Size limits
- Secure file naming (prevents path traversal)
- Organized storage

---

### 13. Dependency Injection with Factories

**Location**: `backend/src/factories/ServiceFactory.ts`

**Pattern**:
```typescript
export class ServiceFactory {
  static createTaskService(): TaskService {
    const taskRepository = RepositoryFactory.createTaskRepository();
    return new TaskService(taskRepository);
  }
}
```

**Usage in Routes**:
```typescript
const taskService = ServiceFactory.createTaskService();
const taskController = new TaskController(taskService);
```

**Benefits**:
- Centralized dependency wiring
- Easy to swap implementations
- Testable (inject mocks)

---

## Validation Checklist

Before committing changes, ensure:

### Code Quality
- [ ] TypeScript compilation passes: `npm run build`
- [ ] No ESLint errors: `npx eslint backend/src --ext .ts`
- [ ] All tests pass: `npm test`
- [ ] 100% coverage in Services: `npm run test:coverage`

### Architecture Compliance
- [ ] Domain entities have no framework dependencies
- [ ] Services check authorization before modify/delete operations
- [ ] Repositories return domain entities (not ORM models)
- [ ] Use cases validate input before execution
- [ ] Controllers return `{message, data}` JSON structure

### Security
- [ ] Passwords hashed with bcrypt (never stored plain)
- [ ] JWT tokens have expiration (`expiresIn: '7d'`)
- [ ] Authorization checks in service layer (not just middleware)
- [ ] No SQL injection (Sequelize ORM parameterizes queries)
- [ ] No XSS vulnerabilities (React escapes by default)

### Database
- [ ] Migrations created for schema changes: `npx sequelize-cli migration:generate`
- [ ] Migrations tested: `npm run db:migrate`
- [ ] Foreign keys have `ON DELETE CASCADE` for data integrity

---

## Troubleshooting

### "Module not found" errors
- Check import paths (use absolute paths from `src/`)
- Verify TypeScript `paths` config in `tsconfig.json`
- Restart TypeScript server in IDE

### Tests failing after refactor
- Check if mocks match new interfaces
- Verify test data matches domain entity constructors
- Run tests in watch mode: `npm run test:watch`

### Database connection errors
- Verify PostgreSQL is running: `pg_isready`
- Check `.env` credentials
- Ensure database exists: `psql -l`

### 401 Unauthorized on protected routes
- Check JWT token in request header: `Authorization: Bearer <token>`
- Verify token not expired (7 days)
- Check `authMiddleware.ts` logic

### TypeScript compilation errors
- Run `npm run build` to see detailed errors
- Check for missing type definitions: `npm install --save-dev @types/<package>`

---

## Additional Resources

### Documentation
- **README.md**: User-facing setup guide
- **QUICK_START.md**: Fast development setup
- **docs/diagrams/**: C4 architecture diagrams

### Testing
- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Supertest**: https://github.com/visionmedia/supertest
- **Coverage Reports**: Run `npm run test:coverage`, open `coverage/lcov-report/index.html`

### Architecture References
- **Clean Architecture**: Robert C. Martin
- **Domain-Driven Design**: Eric Evans
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID

---

## Summary for AI Assistants

**When working on this codebase**:

1. **Read this file FIRST** before making changes
2. **Follow Clean Architecture layers**: Controllers → Services → Repositories → Models
3. **Always check authorization in services** (critical security requirement)
4. **Use domain entities** everywhere (not ORM models)
5. **Validate input** in use cases with validators
6. **Write tests** for all service logic (100% coverage required)
7. **Use mappers** to convert ORM ↔ Domain
8. **Throw custom errors** for clear error handling
9. **Return `{message, data}` JSON** from all controllers
10. **Run validation checklist** before committing

**Project Status**: Week 5/5 MVP completed and extended. All functional requirements met plus advanced features:
- ✅ Role-Based Access Control (3 roles)
- ✅ Project Management
- ✅ Task Comments
- ✅ File Attachments (upload/download)
- ✅ Automatic Task History Tracking
- ✅ Kanban Board View
- ✅ Docker Compose Development Environment
- ✅ Hot-reload for development

**Ready for**: Production deployment, additional features (notifications, real-time collaboration, advanced reporting)

**Contact**: 7th-semester Software Engineering student, UTFPR.

---

*Last Updated: 2025-01-14*
*Version: 2.0* - Extended with RBAC, Projects, Comments, Attachments, and Docker
