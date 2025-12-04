# Backend Development Guide

> **Stack**: TypeScript, Node.js, Express, PostgreSQL, Sequelize, tsyringe
> **Architecture**: Clean Architecture with DDD and SOLID principles

---

## 1. Directory Structure

```
backend/src/
├── app.ts                    # Express app factory
├── server.ts                 # Entry point
├── config/                   # Configuration
├── container/                # tsyringe DI container
├── controllers/              # HTTP handlers
├── domain/
│   └── entities/            # Business entities (Task, User, Project)
├── usecases/                 # Application logic
├── services/                 # Business logic + RBAC
├── interfaces/               # Repository contracts (ITaskRepository, etc.)
├── repositories/             # Data access implementations
├── mappers/                  # Entity <-> ORM Model conversion
├── models/                   # Sequelize ORM models
├── middlewares/              # Express middleware (auth, role, error)
├── routes/                   # Route definitions + validation
├── validators/               # Input validation
├── errors/                   # Custom error classes
├── migrations/               # Database migrations
└── seeders/                  # Test data seeders
```

---

## 2. Clean Architecture Layers

### Layer 1: Domain Entities

Location: `backend/src/domain/entities/`

Pure business logic with no external dependencies.

```typescript
// domain/entities/Task.ts
export class Task {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly title: string,
    public readonly status: TaskStatus,
    public readonly priority: Priority,
    // ...
  ) {}

  isOwnedBy(userId: number): boolean {
    return this.userId === userId;
  }

  isOverdue(): boolean {
    return this.dueDate && new Date() > this.dueDate && !this.isCompleted();
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }
}
```

### Layer 2: Services / Use Cases

Location: `backend/src/services/` and `backend/src/usecases/`

Application business logic with RBAC enforcement.

```typescript
// services/TaskService.ts
@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject('TaskRepository') private taskRepository: ITaskRepository,
    @inject('TaskHistoryRepository') private historyRepository: ITaskHistoryRepository
  ) {}

  async updateTask(taskId: number, userId: number, data: UpdateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);

    // CRITICAL: Authorization check
    if (!task.isOwnedBy(userId)) {
      throw new AuthorizationError('Not authorized to modify this task');
    }

    // Track history
    await this.historyRepository.recordChange(taskId, userId, data);

    return this.taskRepository.update(taskId, data);
  }
}
```

### Layer 3: Interface Adapters

**Controllers** (`controllers/`): Map HTTP requests to services
**Repositories** (`repositories/`): Implement repository interfaces
**Mappers** (`mappers/`): Convert between Domain and ORM

### Layer 4: Infrastructure

**Models** (`models/`): Sequelize ORM definitions
**Middlewares** (`middlewares/`): Express middleware
**Routes** (`routes/`): Route definitions with validation

---

## 3. Data Flow

```
Route Definition (+ validation chain)
       |
       v
authMiddleware (validate JWT, attach user)
       |
       v
roleMiddleware (check permissions)
       |
       v
Controller (extract params, call service)
       |
       v
Service (business logic, authorization)
       |
       v
Repository Interface (ITaskRepository)
       |
       v
Repository Implementation (TaskRepository)
       |
       v
Mapper (toDomain / toPersistence)
       |
       v
Sequelize Model -> PostgreSQL
```

---

## 4. RBAC Implementation

### Middleware Stack

```typescript
// routes/projectRoutes.ts
router.post(
  '/',
  authMiddleware,                    // Step 1: Validate JWT
  requireGestorOrAdmin,              // Step 2: Check role
  createProjectValidation,           // Step 3: Validate input
  ProjectController.create           // Step 4: Handle request
);
```

### Role Middleware

```typescript
// middlewares/roleMiddleware.ts
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireGestorOrAdmin = requireRole('admin', 'gestor');
```

### Service-Level Authorization

```typescript
// services/TaskService.ts
async deleteTask(taskId: number, userId: number, userRole: string): Promise<void> {
  const task = await this.taskRepository.findById(taskId);

  // Admin can delete any task, others only their own
  if (userRole !== 'admin' && !task.isOwnedBy(userId)) {
    throw new AuthorizationError('Cannot delete tasks you do not own');
  }

  await this.taskRepository.delete(taskId);
}
```

---

## 5. Validation

Use `express-validator` in route files.

```typescript
// routes/taskRoutes.ts
const createTaskValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
];

router.post('/', authMiddleware, createTaskValidation, TaskController.create);
```

---

## 6. Error Handling

### Custom Error Classes

```typescript
// errors/index.ts
export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400); }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') { super(message, 401); }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') { super(message, 403); }
}

export class NotFoundError extends AppError {
  constructor(resource: string) { super(`${resource} not found`, 404); }
}

export class UserAlreadyExistsError extends AppError {
  constructor() { super('User already exists', 409); }
}
```

### Error Handler Middleware

```typescript
// middlewares/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
};
```

---

## 7. Dependency Injection

Use `tsyringe` for DI. Register in `container/index.ts`.

```typescript
// container/index.ts
import { container } from 'tsyringe';

// Repositories
container.registerSingleton<ITaskRepository>('TaskRepository', TaskRepository);
container.registerSingleton<IUserRepository>('UserRepository', UserRepository);

// Services
container.registerSingleton<ITaskService>('TaskService', TaskService);
container.registerSingleton<IAuthService>('AuthService', AuthService);
```

Usage in services:

```typescript
@injectable()
export class TaskService {
  constructor(
    @inject('TaskRepository') private taskRepository: ITaskRepository
  ) {}
}
```

---

## 8. API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register (colaborador only) |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/users | Admin | List all users |
| POST | /api/auth/users | Admin | Create user with role |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/tasks | JWT | List user's tasks |
| GET | /api/tasks/kanban | JWT | Get Kanban board |
| POST | /api/tasks | JWT | Create task |
| PUT | /api/tasks/:id | JWT | Update task |
| PATCH | /api/tasks/:id/complete | JWT | Mark complete |
| DELETE | /api/tasks/:id | JWT | Delete task |
| GET | /api/tasks/:id/history | JWT | Task history |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/projects | JWT | List projects |
| POST | /api/projects | Gestor+ | Create project |
| PUT | /api/projects/:id | JWT | Update project |
| DELETE | /api/projects/:id | Gestor+ | Delete project |

### Comments & Attachments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/tasks/:taskId/comments | JWT | List comments |
| POST | /api/tasks/:taskId/comments | JWT | Add comment |
| DELETE | /api/comments/:id | JWT | Delete comment |
| POST | /api/tasks/:taskId/attachments | JWT | Upload file |
| DELETE | /api/attachments/:id | JWT | Delete file |

---

## 9. Commands

```bash
# All commands run via Docker
docker-compose exec backend <command>

# Development
npm run dev                     # Start with hot-reload

# Build
npm run build                   # Compile TypeScript

# Database
npm run db:migrate              # Run migrations
npm run db:migrate:undo         # Rollback last migration
npm run db:seed:all             # Seed test data

# Testing
npm run test                    # Run all tests
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report

# Generate migration
npx sequelize-cli migration:generate --name migration-name
```

---

## 10. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3001 | Server port |
| DATABASE_URL | Yes | - | PostgreSQL connection |
| JWT_SECRET | Yes | - | JWT signing secret |
| JWT_EXPIRES_IN | No | 7d | Token expiry |
| NODE_ENV | No | development | Environment |

---

## 11. Testing

### Test Structure

```
backend/src/
├── services/
│   └── __tests__/
│       ├── TaskService.test.ts
│       └── AuthService.test.ts
└── routes/
    └── security.integration.test.ts
```

### Example Service Test

```typescript
describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      // ...
    };
    taskService = new TaskService(mockTaskRepository);
  });

  describe('updateTask', () => {
    it('should throw AuthorizationError when user does not own task', async () => {
      const task = new Task({ id: 1, userId: 100, title: 'Test' });
      mockTaskRepository.findById.mockResolvedValue(task);

      await expect(
        taskService.updateTask(1, 999, { title: 'New Title' })
      ).rejects.toThrow(AuthorizationError);
    });
  });
});
```

---

## 12. Common Tasks

### Adding a New Field to Task

1. **Create Migration**:
   ```bash
   docker-compose exec backend npx sequelize-cli migration:generate --name add-field-to-tasks
   ```

2. **Edit Migration**: Add column in `up()`, remove in `down()`

3. **Run Migration**:
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

4. **Update Files**:
   - `domain/entities/Task.ts` - Add property
   - `models/Task.ts` - Add Sequelize column
   - `mappers/TaskMapper.ts` - Update mapping
   - `routes/taskRoutes.ts` - Add validation
   - `usecases/CreateTaskUseCase.ts` - Handle field
   - `services/TaskService.test.ts` - Add tests

5. **Run Tests**:
   ```bash
   docker-compose exec backend npm run test
   ```

### Adding a New Endpoint

1. Define route in `routes/*.ts` with validation and middleware
2. Create/update controller method
3. Add service method with authorization
4. Add repository method if needed
5. Write tests
