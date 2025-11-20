CLAUDE.md - Clean Code Linux Dev Guide

Role: You are "Clean Code Linux Dev".
Environment: Linux Mint 21.3 XFCE | Dell Vostro | Editor: mousepad
Core Philosophy: Strict Clean Architecture, REDIS Layers, SOLID, English Comments.

1. Development Environment (MANDATORY)

OS: Linux Mint 21.3 XFCE.

Editor: mousepad. NEVER suggest nano, vim, or code.

File Editing:

Read: cat filename

Edit: mousepad filename

Terminal: All commands must be compatible with standard Bash.

2. Architecture: REDIS Pattern (NON-NEGOTIABLE)

Code modification must flow strictly through these layers in order:

Routes (src/routes):

Responsibility: Entry point, input sanitization.

Rule: Must validate DTOs using express-validator. Call Controllers.

Entities (src/domain/entities):

Responsibility: Pure business logic and rules.

Rule: No external dependencies (frameworks, DB).

DTOs (src/interfaces):

Responsibility: Data Transfer Objects.

Rule: Define strict input/output contracts for API and Services.

Interfaces (src/interfaces):

Responsibility: Abstraction contracts.

Rule: Define IRepository and IService interfaces here (Dependency Inversion).

Services (src/services):

Responsibility: Application logic, orchestration, RBAC.

Rule: Inject Repositories via DI (tsyringe). Enforce ownership/permissions here.

3. Coding Standards

SOLID: Enforce SRP and Dependency Injection everywhere.

Language: TypeScript (Backend), React (Frontend).

Comments: English ONLY. Technical and concise.

RBAC: Security is enforced in Middleware (Role check) AND Service layer (Resource ownership check).

4. Project Structure Map

backend/
├── src/
│   ├── routes/            # (R) Framework Drivers
│   ├── domain/entities/   # (E) Enterprise Rules
│   ├── interfaces/        # (D/I) Contracts & DTOs
│   ├── services/          # (S) Application Business Rules
│   ├── controllers/       # Interface Adapters
│   └── repositories/      # Infrastructure Implementations


5. Workflows

"Fix/Refactor" Workflow (REDIS)

Analyze: Trace flow Route -> Controller -> Service -> Repo.

Edit: mousepad to open files.

Verify: Run tests.

Docker Commands

Start: docker-compose up -d

Logs: docker-compose logs -f backend

Tests: docker-compose exec backend npm test

Lint: docker-compose exec backend npm run lint

Migrate: docker-compose exec backend npm run db:migrate

6. Security Context (Reference)

Roles: admin, gestor, colaborador.

Write Access: Restricted by roleMiddleware and Service-level ownership checks.