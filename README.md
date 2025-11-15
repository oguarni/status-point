# Task Management System

A full-stack task management application implementing Clean Architecture with Role-Based Access Control.

**Repository:** https://github.com/oguarni/status-point.git

## 🚀 Quick Start (Docker)

```bash
# Clone and start
git clone https://github.com/oguarni/status-point.git
cd status-point
docker compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskmanager.com | admin123 |
| Manager | gestor@taskmanager.com | gestor123 |
| Developer | colaborador@taskmanager.com | colaborador123 |

## 📋 Features

### Core Functionality
- ✅ User authentication (JWT + bcrypt)
- ✅ Role-based access control (admin, gestor, colaborador)
- ✅ Task CRUD operations with authorization
- ✅ Project management
- ✅ Task comments and attachments
- ✅ Task history tracking
- ✅ Kanban board view
- ✅ **Internationalization (i18n)** - English/Portuguese language support with dropdown selector

### Technical Highlights
- ✅ Clean Architecture with SOLID principles
- ✅ Domain-Driven Design patterns
- ✅ 100% test coverage in Services layer
- ✅ Docker Compose with hot-reload
- ✅ Comprehensive API documentation
- ✅ Multi-language support (react-i18next)

## 🛠️ Tech Stack

**Backend:** Node.js, Express, TypeScript, PostgreSQL, Sequelize
**Frontend:** React 18, TypeScript, Vite, React Router v6
**DevOps:** Docker, Docker Compose
**Testing:** Jest, Supertest

## 📁 Project Structure

```
.
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── domain/      # Business entities
│   │   ├── usecases/    # Application logic
│   │   ├── services/    # Business logic (100% coverage)
│   │   ├── repositories/# Data access layer
│   │   ├── controllers/ # API endpoints
│   │   ├── mappers/     # ORM ↔ Domain conversion
│   │   └── models/      # Sequelize ORM
│   └── scripts/         # Database seeding & testing
│
├── frontend/            # React SPA
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       ├── contexts/    # React contexts
│       └── services/    # API clients
│
├── docs/                # Architecture diagrams (C4)
├── docker-compose.yml   # Docker orchestration
└── CLAUDE.md           # Comprehensive developer guide
```

## 🏗️ Architecture

This project follows **Clean Architecture** with 4 layers:

1. **Domain Layer** - Pure business entities (Task, User, Project)
2. **Use Cases Layer** - Application-specific business rules
3. **Interface Adapters** - Controllers, repositories, mappers
4. **Infrastructure** - Framework implementations (Express, Sequelize)

### Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React SPA<br/>TypeScript + Vite]
        A1[Pages<br/>Login, Tasks, Kanban]
        A2[Components<br/>Layout, Modals]
        A3[Contexts<br/>Auth, i18n]
        A4[Services<br/>API Client]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end

    subgraph "API Layer - Clean Architecture"
        B[Controllers]
        B --> |HTTP Validation| C[Services]
        C --> |Business Logic| D[Repositories]
        D --> |Data Access| E[Mappers]
        E --> |ORM Conversion| F[Models - Sequelize]
    end

    subgraph "Domain Layer"
        G[Entities<br/>Task, User, Project]
        H[Use Cases<br/>CreateTask, UpdateTask]
        I[Validators<br/>Business Rules]
        C --> G
        C --> H
        C --> I
    end

    subgraph "Infrastructure"
        F --> J[(PostgreSQL<br/>Database)]
        K[Middlewares<br/>Auth, RBAC, Upload]
        K --> B
    end

    A4 --> |HTTPS/REST| K

    subgraph "Security & Features"
        L[JWT Authentication<br/>7-day expiry]
        M[bcrypt Password Hash]
        N[Role-Based Access Control<br/>admin, gestor, colaborador]
        O[File Upload<br/>Multer + 10MB limit]
        P[i18n Support<br/>English/Portuguese]
    end

    style A fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style B fill:#68a063,stroke:#333,stroke-width:2px
    style C fill:#f39c12,stroke:#333,stroke-width:2px
    style D fill:#3498db,stroke:#333,stroke-width:2px
    style F fill:#e74c3c,stroke:#333,stroke-width:2px
    style J fill:#9b59b6,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#2ecc71,stroke:#333,stroke-width:2px
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant React Frontend
    participant Auth Middleware
    participant Controller
    participant Service
    participant Repository
    participant Database

    User->>React Frontend: Login Request
    React Frontend->>Controller: POST /api/auth/login
    Controller->>Service: Authenticate
    Service->>Repository: Find User by Email
    Repository->>Database: SELECT * FROM users
    Database-->>Repository: User Data
    Repository-->>Service: User Entity
    Service->>Service: Verify Password (bcrypt)
    Service-->>Controller: JWT Token + User
    Controller-->>React Frontend: {token, user}
    React Frontend->>React Frontend: Store Token (localStorage)

    Note over User,Database: Subsequent Requests

    User->>React Frontend: Create Task
    React Frontend->>Auth Middleware: POST /api/tasks + JWT
    Auth Middleware->>Auth Middleware: Verify Token
    Auth Middleware->>Controller: Authorized Request
    Controller->>Service: Create Task
    Service->>Service: Validate + Check Permissions
    Service->>Repository: Create Task
    Repository->>Database: INSERT INTO tasks
    Database-->>Repository: New Task
    Repository-->>Service: Task Entity
    Service-->>Controller: Task Entity
    Controller-->>React Frontend: {message, data: task}
    React Frontend-->>User: Task Created
```

### Technology Stack Architecture

```mermaid
graph LR
    subgraph "Development"
        A[Docker Compose<br/>Hot-Reload]
        B[TypeScript<br/>Type Safety]
        C[Jest + Supertest<br/>100% Coverage]
    end

    subgraph "Backend Stack"
        D[Node.js + Express]
        E[Sequelize ORM]
        F[PostgreSQL]
        G[JWT + bcrypt]
    end

    subgraph "Frontend Stack"
        H[React 18]
        I[Vite]
        J[React Router v6]
        K[Axios + i18next]
    end

    A --> D
    A --> H
    D --> E
    E --> F
    D --> G
    H --> I
    H --> J
    H --> K

    style A fill:#2496ed,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#68a063,stroke:#333,stroke-width:2px
    style F fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
```

### C4 Diagrams

Static architecture diagrams are also available:
- ![System Context](./docs/diagrams/SystemContext.png)
- ![Container View](./docs/diagrams/Container.png)
- ![Backend Components](./docs/diagrams/Component_Backend.png)

## 🧪 Testing

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Current Coverage:** 100% in Services layer

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Tasks (Protected)
- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/complete` - Mark complete
- `DELETE /api/tasks/:id` - Delete task

### Projects (Protected)
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (admin/gestor only)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

*Full API documentation in [CLAUDE.md](./CLAUDE.md#api-endpoints)*

## ⚙️ Manual Setup (Without Docker)

<details>
<summary>Click to expand manual setup instructions</summary>

### Prerequisites
- Node.js v18+
- PostgreSQL v12+

### Backend

```bash
cd backend
npm install

# Create database
psql -U postgres -c "CREATE DATABASE task_management_dev;"

# Configure .env
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

</details>

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive guide for developers and AI assistants
  - Detailed architecture explanations
  - Code patterns and conventions
  - Testing strategies
  - Common tasks and workflows

## 🎓 Academic Context

- **Course:** Software Engineering, 7th semester
- **Institution:** UTFPR (Federal University of Technology - Paraná)
- **Purpose:** Demonstrate Clean Architecture implementation
- **Achievements:**
  - ✅ 10+ functional requirements (5 minimum required)
  - ✅ Clean Architecture with SOLID
  - ✅ 100% service layer test coverage
  - ✅ Role-Based Access Control
  - ✅ Advanced features (comments, attachments, history)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

Educational project for UTFPR Software Engineering course.

## 👤 Author

7th-semester Software Engineering student, UTFPR

---

**Need more details?** Check [CLAUDE.md](./CLAUDE.md) for comprehensive documentation.
