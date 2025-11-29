Title: CLAUDE.md - Projeto Agiliza
Path: oguarni/status-point/status-point-claude-add-dropdown-selector-01PXaZrGrw6s5c4LqckowLLH/CLAUDE.md
# CLAUDE.md - AI Assistant Guide

> **Purpose**: This document provides AI context for the Projeto Agiliza codebase. This is an academic project demonstrating Clean Architecture.
> **Status**: MVP is complete. Focus is on maintenance, refactoring, and new features.

---

## 1. Project Overview

* **Domain**: A full-stack Task Management System (like Trello/Jira).
* **Key Features**: User Auth (JWT), Role-Based Access Control (RBAC), Project Management, Tasks, Comments, File Attachments, Task History.
* **Tech Stack**:
    * **Backend**: TypeScript, Node.js, Express, PostgreSQL, Sequelize, `tsyringe` (DI), express-validator (Validation), Jest.
    * **Frontend**: React, TypeScript, Vite, TailwindCSS, React Router, Axios.
    * **DevOps**: Docker, Docker Compose.

---

## 2. CRITICAL: Architecture & Patterns (Backend)

This project **strictly** follows **Clean Architecture**, **SOLID**, and **DDD** principles. Adherence to these patterns is mandatory.

### Core Layers (Dependency Rule: Outer -> Inner)

1.  **Domain (`backend/src/domain/entities/`)**: Pure business logic (e.g., `Task.ts`, `User.ts`). No external dependencies.
2.  **Use Cases / Services (`backend/src/services/` & `usecases/`)**: Application business logic. Orchestrates entities and repository interfaces. **RBAC is enforced here.**
3.  **Interfaces (`backend/src/interfaces/`)**: Defines repository contracts (e.g., `ITaskRepository.ts`).
4.  **Infrastructure (Frameworks & Drivers)**:
    * **Controllers (`controllers/`)**: Map HTTP requests to Services.
    * **Repositories (`repositories/`)**: Implements repository interfaces using Sequelize.
    * **Models (`models/`)**: Sequelize ORM models. **NEVER** use these in Services.
    * **Mappers (`mappers/`)**: Converts between Domain Entities and ORM Models.
    * **Container (`container/`)**: `tsyringe` DI registration.

### Key Patterns & Rules

* **DI**: Use `tsyringe`. Register services/repositories in `backend/src/container/index.ts`.
* **Data Flow**: Route → Controller → Validator → Service → IRepository → RepositoryImpl → Mapper → ORM Model → DB.
* **Validation**: Use `express-validator` validation chains in route files (`backend/src/routes/`). Validation occurs in the **route layer** before controllers.
* **Error Handling**: Services **must throw** custom errors (from `backend/src/errors/`). The `errorHandler.ts` middleware formats the JSON response.
* **Authorization (RBAC)**: Roles (`admin`, `gestor`, `colaborador`) are enforced using `roleMiddleware` in routes and ownership checks in the **Service** layer for fine-grained control.

---

## 3. Security & RBAC Model

The system enforces a strict Role-Based Access Control (RBAC) model. All "write" operations (POST, PUT, DELETE, PATCH) on protected resources are secured through a combination of JWT authentication middleware and role-checking middleware.

### Roles & Permissions

The system defines three distinct roles with hierarchical permissions:

* **`admin`**: Full administrative access
  * Can manage all users, projects, and tasks
  * Can create users with any role via `/api/auth/users` endpoint
  * Full CRUD operations on all resources
  * Enforced by: `requireAdmin` middleware

* **`gestor`** (Manager): Project and team management
  * Can create and manage projects
  * Can manage tasks across projects
  * Can assign tasks to team members
  * Cannot manage user accounts
  * Enforced by: `requireGestorOrAdmin` middleware

* **`colaborador`** (Collaborator): Personal task management
  * Can view projects and tasks
  * Can create and manage their own tasks
  * Can add comments and attachments
  * Cannot create projects or manage other users' tasks
  * Limited write access enforced by ownership checks in services

### Public vs. Authenticated Endpoints

**Public Endpoints** (No authentication required):
* `POST /api/auth/login` - User authentication
* `POST /api/auth/register` - Public user registration

**Security Hardening**:
* The public `/register` endpoint is **hardcoded** to only create users with the `colaborador` role
* This prevents privilege escalation attacks where attackers could register as admin/gestor
* See `backend/src/services/AuthService.ts:56` - `role: UserRole = 'colaborador'`

**Authenticated Endpoints** (Require valid JWT):
* All endpoints under `/api/tasks`, `/api/projects`, `/api/comments`, `/api/attachments`
* JWT validation handled by `authMiddleware` (`backend/src/middlewares/authMiddleware.ts`)
* Token must be provided in `Authorization: Bearer <token>` header

**Role-Protected Endpoints** (Require specific roles):
* `POST /api/projects` - Requires `gestor` or `admin`
* `POST /api/auth/users` - Requires `admin`
* Other write operations enforced by service-level ownership checks

### Middleware Stack

The security model is enforced through layered middleware:

1. **`authMiddleware`** (`backend/src/middlewares/authMiddleware.ts`)
   * Validates JWT token
   * Extracts user information and attaches to `req.user`
   * Returns 401 Unauthorized if token is invalid or missing

2. **`roleMiddleware`** (`backend/src/middlewares/roleMiddleware.ts`)
   * Checks if authenticated user has required role
   * Provides utility functions: `requireRole()`, `requireAdmin`, `requireGestorOrAdmin`
   * Returns 403 Forbidden if user lacks required role
   * Example usage:
     ```typescript
     router.post('/projects', authMiddleware, requireGestorOrAdmin, controller.create);
     ```

3. **Service-Level Authorization**
   * Services verify resource ownership before modifications
   * Example: `TaskService.updateTask()` checks `task.isOwnedBy(userId)`
   * Returns `AuthorizationError` (403) if ownership check fails

### Security Test Coverage

Security integration tests verify RBAC enforcement:
* `backend/src/routes/security.integration.test.ts`
* Tests colaborador restrictions on write operations
* Validates 403 responses for unauthorized actions
* Ensures authentication is required for all protected endpoints

### Example: Secure Project Creation Flow

```
Client Request → authMiddleware (validate JWT)
             → requireGestorOrAdmin (check role)
             → validation chain (validate input)
             → ProjectController
             → ProjectService (business logic)
             → ProjectRepository
             → Database
```

If colaborador attempts: Returns **403 Forbidden** at roleMiddleware layer.

---

## 4. Docker-Only Development Workflow

**CRITICAL**: This project runs **entirely** within Docker. Do not use local `npm` commands on your host.

* **Start All Services (Frontend, Backend, DB)**:
    ```bash
    docker-compose up -d --build
    ```
* **Stop All Services**:
    ```bash
    docker-compose down
    ```
* **Run Backend Commands (Migrations, Tests, etc.)**:
    Use `docker-compose exec backend <command>`
    * **Run Migrations**: `docker-compose exec backend npm run db:migrate`
    * **Run Seeders**: `docker-compose exec backend npm run db:seed:all`
    * **Run All Tests**: `docker-compose exec backend npm run test`
    * **Run Linter**: `docker-compose exec backend npm run lint`

---

## 5. Common Tasks

### Task: Add a new `priority` (string) field to the `Task` entity

1.  **Create Migration**:
    ```bash
    docker-compose exec backend npx sequelize-cli migration:generate --name add-priority-to-tasks
    ```
2.  **Edit Migration File**:
    * `mousepad backend/src/migrations/TIMESTAMP-add-priority-to-tasks.js`
    * Add the `priority` column (e.g., `type: Sequelize.STRING`).
3.  **Run Migration**:
    ```bash
    docker-compose exec backend npm run db:migrate
    ```
4.  **Update Domain Entity**:
    * `mousepad backend/src/domain/entities/Task.ts` (Add `public priority: string;`)
5.  **Update ORM Model**:
    * `mousepad backend/src/models/Task.ts` (Add `@Column(DataType.STRING) public priority!: string;`)
6.  **Update Mapper**:
    * `mousepad backend/src/mappers/TaskMapper.ts` (Update `toDomain` and `toPersistence`).
7.  **Update Route Validation**:
    * Update validation chain in `backend/src/routes/taskRoutes.ts`
    * Add: `body('priority').optional().isIn(['low', 'medium', 'high'])`
8.  **Update Services/Use Cases**:
    * `mousepad backend/src/usecases/CreateTaskUseCase.ts`
    * `mousepad backend/src/usecases/UpdateTaskUseCase.ts`
9.  **Update Tests**:
    * `mousepad backend/src/services/TaskService.test.ts`
10. **Run Tests**:
    ```bash
    docker-compose exec backend npm run test
    ```