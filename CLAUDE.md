# CLAUDE.md - Projeto Agiliza

> **Purpose**: AI context for the Projeto Agiliza codebase. Academic project demonstrating Clean Architecture.
> **Status**: MVP Complete. Focus on maintenance, refactoring, and new features.

---

## 1. Project Overview

* **Domain**: Full-stack Task Management System (like Trello/Jira)
* **Key Features**: User Auth (JWT), RBAC, Projects, Tasks, Comments, Attachments, History
* **Architecture Diagrams**: C4 model in `docs/diagrams/`

### Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | TypeScript, Node.js, Express, PostgreSQL, Sequelize, tsyringe |
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Router, Axios |
| DevOps | Docker, Docker Compose |

---

## 2. Quick Start (Docker)

```bash
# Start all services
docker-compose up -d --build

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001

# Seed test data
docker-compose exec backend npm run db:seed:all
```

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| admin | admin@taskmanager.com | admin123 |
| gestor | gestor@taskmanager.com | gestor123 |
| colaborador | colaborador@taskmanager.com | colaborador123 |

---

## 3. Architecture Overview

This project follows **Clean Architecture**, **SOLID**, and **DDD** principles.

### Core Layers (Dependency Rule: Outer -> Inner)

```
+-------------------------------------------------------------+
|  DOMAIN (domain/entities/)                                  |
|  - Pure business entities: Task, User, Project              |
|  - No external dependencies                                 |
+-------------------------------------------------------------+
|  USE CASES / SERVICES (services/, usecases/)                |
|  - Application business logic                               |
|  - RBAC enforcement                                         |
+-------------------------------------------------------------+
|  INTERFACE ADAPTERS (controllers/, repositories/)           |
|  - HTTP handlers, data access implementations               |
+-------------------------------------------------------------+
|  INFRASTRUCTURE (models/, middlewares/)                     |
|  - Express, Sequelize, JWT implementation                   |
+-------------------------------------------------------------+
```

---

## 4. RBAC Security Model

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **admin** | Full access - manage users, projects, all tasks |
| **gestor** | Create/manage projects, manage team tasks |
| **colaborador** | CRUD own tasks, view projects, add comments |

### Security Layers

1. **authMiddleware** - JWT validation (401 if invalid)
2. **roleMiddleware** - Role checks (403 if unauthorized)
3. **Service-level** - Ownership verification

---

## 5. Component Documentation

For detailed development guides:

| Component | Documentation |
|-----------|---------------|
| Backend | See [`backend/CLAUDE.md`](./backend/CLAUDE.md) |
| Frontend | See [`frontend/CLAUDE.md`](./frontend/CLAUDE.md) |

---

## 6. Docker Commands

```bash
# Start all services
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run backend commands
docker-compose exec backend npm run test
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed:all
```

---

## 7. Academic Context

**Course**: Arquitetura de Software (AS27S)
**Institution**: UTFPR - Universidade Tecnologica Federal do Parana
**Authors**: Aurelio Antonio Brites de Miranda, Gabriel Felipe Guarnieri
**Advisor**: Prof. Dr. Francisco Carlos
