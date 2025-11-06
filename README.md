# Task Management System - MVP

A full-stack task management application built with Node.js, Express, TypeScript, React, and PostgreSQL following Clean Architecture principles.

## Project Structure

```
.
├── backend/          # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── models/       # Sequelize models (User, Task)
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic layer
│   │   ├── controllers/  # API controllers
│   │   ├── routes/       # Express routes
│   │   ├── middlewares/  # Auth & error handling
│   │   └── errors/       # Custom error classes
│   └── package.json
│
├── frontend/         # Frontend SPA (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## Features

### Authentication
- ✅ User registration (HU1)
- ✅ User login with JWT (HU2)
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware

### Task Management
- ✅ Create tasks (HU3)
- ✅ Edit tasks (HU4)
- ✅ Delete tasks (HU5)
- ✅ List tasks (HU6)
- ✅ Mark tasks as completed (HU7)
- ✅ Authorization checks (users can only manage their own tasks)

### Testing
- ✅ Unit tests for Services (AuthService, TaskService)
- ✅ Integration tests for Controllers (TaskController)
- ✅ Jest + Supertest

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Testing**: Jest, Supertest, ts-jest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE task_management_dev;
\q
```

Or use your preferred PostgreSQL client.

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_USER=postgres
# DB_PASS=your_password
# DB_NAME=task_management_dev
# JWT_SECRET=your-secret-key
# PORT=3001

# Run database migrations (create tables)
npm run db:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Tasks (Protected)

All task endpoints require `Authorization: Bearer <token>` header.

- `GET /api/tasks` - Get all user's tasks
- `POST /api/tasks` - Create a new task
  ```json
  {
    "title": "My Task",
    "description": "Task description",
    "priority": "high"
  }
  ```
- `PUT /api/tasks/:id` - Update a task
- `PATCH /api/tasks/:id/complete` - Mark task as completed
- `DELETE /api/tasks/:id` - Delete a task

## Database Schema

### Users Table
```sql
CREATE TABLE "Users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE "Tasks" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
  "priority" VARCHAR(50),
  "due_date" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_tasks_user_id" ON "Tasks"("user_id");
```

## Architecture (C4 Model)

This project follows **Clean Architecture** principles, implemented as an N-Layer architecture to ensure a strong separation of concerns and dependency inversion.

The architecture is documented below using the C4 model.

### Level 1: System Context

This C4 Level 1 diagram illustrates the highest-level interaction with the system.

**[System Context] Task Management System**
![C4 System Context Diagram](./docs/diagrams/SystemContext.png)
* **User (Person):** The primary actor, "Student/Professional managing tasks".
* **Task Management System (Software System):** The system itself, "MVP system to create and manage personal tasks".
* **Interaction:** The "User" "Uses" the "Task Management System" via [HTTPS].

### Level 2: Container

This C4 Level 2 diagram details the main deployable containers within the "Task Management System".

**[Container] Task Management System**
![C4 Container Diagram](./docs/diagrams/Container.png)
* **User (Person):** Initiates interaction by "Using" the Frontend via [HTTPS].
* **Frontend (SPA) (Container: React / Vite):** The user interface. "Makes API calls" to the Backend via [JSON/HTTPS].
* **Backend (API) (Container: Node.js / Express):** Validates, applies business rules, and exposes the API. "Reads and Writes" to the database via [SQL / Sequelize].
* **Database (Container: PostgreSQL):** Stores user and task data.

### Level 3: Component (Backend)

This C4 Level 3 diagram details the internal component architecture of the "Backend (API)" container.

**[Component] Task Management System - Backend (API)**
![C4 Component Diagram - Backend](./docs/diagrams/Component_Backend.png)
* The **Frontend (SPA)** sends an "API Request" [JSON].
* **Middlewares (Component: Express / JWT):** Receives the request and handles authentication.
* **Controllers (Component: Express):** Receives the verified request, validates HTTP inputs.
* **Services (Component: TypeScript / SOLID):** Called by the Controller to orchestrate use cases and business logic.
* **Repositories (Component: Sequelize (ORM)):** Called by the Service to abstract data access.
* **Models (Component: Sequelize (ORM)):** Used by Repositories to define entities (User, Task).
* **Repositories** execute the "SQL Query" on the **Database**.

### Key Design Decisions

- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Inversion**: Higher layers don't depend on lower layers
- **Authorization**: Enforced at the Service layer (not just middleware)
- **Error Handling**: Custom error classes with centralized error handler
- **JWT Authentication**: Stateless authentication with Bearer tokens
- **Input Validation**: Using express-validator at the Controller layer

## Clean Architecture Implementation

The backend has been enhanced with a full Clean Architecture implementation following SOLID principles and Domain-Driven Design (DDD) patterns.

### Project Structure (Backend)

```
backend/src/
├── config/          # Application configuration
│   ├── database.js  # Database configuration
│   └── app.config.ts # Centralized app configuration
├── domain/          # Domain Layer (Business Entities)
│   └── entities/
│       ├── Task.ts  # Task domain entity with business methods
│       └── User.ts  # User domain entity with business methods
├── interfaces/      # Interface definitions
│   ├── ITaskRepository.ts  # Task repository interface
│   ├── IUserRepository.ts  # User repository interface
│   ├── ITaskService.ts     # Task service interface
│   ├── IAuthService.ts     # Auth service interface
│   └── index.ts            # Centralized exports
├── usecases/        # Use Cases (Application Logic)
│   ├── CreateTaskUseCase.ts  # Create task use case
│   ├── UpdateTaskUseCase.ts  # Update task use case
│   ├── DeleteTaskUseCase.ts  # Delete task use case
│   ├── GetTasksUseCase.ts    # Get tasks use case
│   └── index.ts
├── repositories/    # Data Access Layer
│   ├── TaskRepository.ts  # Task data access
│   └── UserRepository.ts  # User data access
├── services/        # Business Logic Layer
│   ├── TaskService.ts  # Task business logic
│   └── AuthService.ts  # Authentication business logic
├── controllers/     # API Layer (Presentation)
│   ├── TaskController.ts
│   └── AuthController.ts
├── mappers/         # Object Mappers
│   ├── TaskMapper.ts  # Maps between Task models and entities
│   └── UserMapper.ts  # Maps between User models and entities
├── validators/      # Business Rule Validators
│   ├── TaskValidator.ts  # Task validation rules
│   └── UserValidator.ts  # User validation rules
├── factories/       # Factory Pattern
│   ├── RepositoryFactory.ts  # Creates repository instances
│   └── ServiceFactory.ts     # Creates service instances
├── container/       # Dependency Injection Container
│   └── index.ts     # InversifyJS container configuration
├── utils/           # Utilities
│   └── logger.ts    # Logging abstraction (ILogger)
├── models/          # ORM Models (Sequelize)
│   ├── Task.ts
│   └── User.ts
├── routes/          # Express routes
├── middlewares/     # Middleware functions
└── errors/          # Custom error classes
```

### Architecture Layers

#### 1. Domain Layer (`domain/entities/`)
Contains pure business logic and entities with no external dependencies.

**Task Entity:**
- `isOwnedBy(userId)` - Check task ownership
- `isCompleted()` - Check completion status
- `isOverdue()` - Check if task is overdue
- `getPriorityValue()` - Get priority as numeric value

**User Entity:**
- `hasValidEmail()` - Validate email format
- `toSafeObject()` - Get user data without password

#### 2. Use Cases Layer (`usecases/`)
Application-specific business rules that orchestrate the flow of data.

- `CreateTaskUseCase` - Handles task creation with validation
- `UpdateTaskUseCase` - Handles task updates with authorization
- `DeleteTaskUseCase` - Handles task deletion with authorization
- `GetTasksUseCase` - Handles task retrieval with pagination

Each use case:
- Validates input using validators
- Applies business rules
- Uses repositories for data access
- Logs operations
- Returns domain entities

#### 3. Interface Layer (`interfaces/`)
Defines contracts for all dependencies:

- `ITaskRepository` - Task data access contract
- `IUserRepository` - User data access contract
- `ITaskService` - Task service contract
- `IAuthService` - Auth service contract
- `ILogger` - Logging contract

#### 4. Repositories (`repositories/`)
Implements data access interfaces and uses mappers to convert between ORM models and domain entities.

**Features:**
- Returns domain entities (not ORM models)
- Uses TaskMapper/UserMapper for conversions
- Implements pagination support
- Abstracts database operations

#### 5. Mappers (`mappers/`)
Convert between different representations:

```typescript
TaskMapper.toDomain(model) // ORM Model -> Domain Entity
TaskMapper.toModel(entity)  // Domain Entity -> ORM Model
TaskMapper.toDomainList(models) // Array conversion
```

#### 6. Validators (`validators/`)
Validate business rules before data processing:

- `TaskValidator.validateCreate(data)` - Validates task creation
- `TaskValidator.validateUpdate(data)` - Validates task updates
- `UserValidator.validateRegister(data)` - Validates user registration
- `UserValidator.validateLogin(data)` - Validates login credentials

Returns: `{ isValid: boolean, errors: string[] }`

#### 7. Factories (`factories/`)
Create instances with proper dependency injection:

```typescript
RepositoryFactory.createTaskRepository()
ServiceFactory.createTaskService()
```

#### 8. Dependency Injection Container (`container/`)
Uses InversifyJS for dependency injection:

```typescript
container.bind<ITaskRepository>('TaskRepository').to(TaskRepository)
container.bind<ILogger>('Logger').toDynamicValue(...)
```

#### 9. Configuration (`config/app.config.ts`)
Centralizes all environment variables and settings:

```typescript
AppConfig.jwt.secret
AppConfig.database.host
AppConfig.server.port
```

#### 10. Logger (`utils/logger.ts`)
Provides logging abstraction:

```typescript
const logger = new ConsoleLogger('TaskService');
logger.info('Task created', { taskId: 1 });
logger.error('Task creation failed', error);
```

### Design Patterns Used

1. **Repository Pattern** - Abstracts data access
2. **Factory Pattern** - Creates instances with dependencies
3. **Dependency Injection** - Inverts control flow
4. **Mapper Pattern** - Converts between representations
5. **Strategy Pattern** - Validators implement validation strategies
6. **Use Case Pattern** - Encapsulates application logic

### Benefits

- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features
- **Flexibility**: Easy to swap implementations
- **Domain-Centric**: Business logic is independent of frameworks

### Pagination Support

The TaskRepository now supports pagination:

```typescript
const result = await taskRepository.findAllByUserIdPaginated(userId, {
  page: 1,
  limit: 20,
  orderBy: 'created_at',
  order: 'DESC'
});

// Returns: { data: Task[], total: number, page: number, totalPages: number }
```

### Testing

Tests are provided for:
- ✅ Validators (TaskValidator, UserValidator)
- ✅ Use Cases (CreateTaskUseCase with mocked dependencies)
- ✅ Services (Integration tests)
- ✅ Controllers (API tests)

Run tests with:
```bash
npm test
```

## Usage

1. Open `http://localhost:3000` in your browser
2. Register a new account
3. Login with your credentials
4. Create, view, update, and delete tasks
5. Mark tasks as completed
6. Logout when done

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ folder with your preferred static server
```

## License

This is an educational project for UTFPR Software Engineering course.

## Authors

- 7th-semester Software Engineering student (UTFPR)
