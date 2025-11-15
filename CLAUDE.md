Title: CLAUDE.md - Project Status Point
Path: oguarni/status-point/status-point-claude-add-dropdown-selector-01PXaZrGrw6s5c4LqckowLLH/CLAUDE.md
# CLAUDE.md - AI Assistant Guide

> **Purpose**: This document provides AI context for the `status-point` codebase. This is an academic project demonstrating Clean Architecture.
> **Status**: MVP is complete. Focus is on maintenance, refactoring, and new features.

---

## 1. Project Overview

* **Domain**: A full-stack Task Management System (like Trello/Jira).
* **Key Features**: User Auth (JWT), Role-Based Access Control (RBAC), Project Management, Tasks, Comments, File Attachments, Task History.
* **Tech Stack**:
    * **Backend**: TypeScript, Node.js, Express, PostgreSQL, Sequelize, `tsyringe` (DI), Zod (Validation), Jest.
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
* **Validation**: Use `Zod` schemas from `backend/src/validators/`. Validation occurs in the **Controller**.
* **Error Handling**: Services **must throw** custom errors (from `backend/src/errors/`). The `errorHandler.ts` middleware formats the JSON response.
* **Authorization (RBAC)**: Roles (`admin`, `gestor`, `colaborador`) are checked in the **Service** layer for fine-grained control.

---

## 3. Docker-Only Development Workflow

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

## 4. Common Tasks

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
7.  **Update Validator (DTO)**:
    * `mousepad backend/src/validators/TaskValidator.ts` (Add `priority: z.string()` to schemas).
8.  **Update Services/Use Cases**:
    * `mousepad backend/src/usecases/CreateTaskUseCase.ts`
    * `mousepad backend/src/usecases/UpdateTaskUseCase.ts`
9.  **Update Tests**:
    * `mousepad backend/src/services/TaskService.test.ts`
    * `mousepad backend/src/validators/TaskValidator.test.ts`
10. **Run Tests**:
    ```bash
    docker-compose exec backend npm run test
    ```