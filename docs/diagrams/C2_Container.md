# C4 Model - Level 2: Container Diagram

## Agiliza Task Management System - Containers

This diagram shows the containers (applications and data stores) that make up the Agiliza system and how they interact.

```mermaid
C4Container
    title Container Diagram for Agiliza Task Management System

    Person(user, "User", "Admin, Manager, or Developer using the system")

    System_Boundary(c1, "Agiliza Task Management System") {
        Container(spa, "Single Page Application", "React, TypeScript, Vite", "Provides task management UI through web browser with i18n support")
        Container(api, "API Application", "Node.js, Express, TypeScript", "Provides REST API for task and project management with JWT authentication and RBAC")
        ContainerDb(db, "Database", "PostgreSQL", "Stores users, tasks, projects, comments, attachments metadata, and audit history")
        Container(fileSystem, "File System", "Local Disk/Volume", "Stores task attachment files")
    }

    Rel(user, spa, "Uses", "HTTPS")
    Rel(spa, api, "Makes API calls to", "JSON/HTTPS")
    Rel(api, db, "Reads from and writes to", "SQL/TCP")
    Rel(api, fileSystem, "Stores and retrieves files", "File I/O")

    UpdateRelStyle(user, spa, $textColor="blue", $lineColor="blue")
    UpdateRelStyle(spa, api, $textColor="blue", $lineColor="blue")
    UpdateRelStyle(api, db, $textColor="green", $lineColor="green")
    UpdateRelStyle(api, fileSystem, $textColor="orange", $lineColor="orange")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Container Descriptions

#### 1. Single Page Application (SPA)
- **Technology**: React 18, TypeScript, Vite, TailwindCSS
- **Purpose**: Provides the user interface for task management
- **Features**:
  - Kanban board view
  - Task CRUD operations
  - Project management
  - Comments and attachments
  - Internationalization (PT-BR/EN)
  - Role-based UI elements

#### 2. API Application
- **Technology**: Node.js, Express, TypeScript
- **Purpose**: Business logic and data access layer
- **Features**:
  - RESTful API endpoints
  - JWT authentication
  - Role-Based Access Control (RBAC)
  - Clean Architecture implementation
  - Request validation
  - Error handling

#### 3. Database
- **Technology**: PostgreSQL with Sequelize ORM
- **Purpose**: Persistent data storage
- **Stores**:
  - User accounts and roles
  - Tasks and projects
  - Comments and task history
  - Attachment metadata

#### 4. File System
- **Technology**: Local disk storage (Docker volume)
- **Purpose**: Stores uploaded task attachments
- **Features**:
  - Multer file upload handling
  - Unique filename generation
  - 10MB file size limit

### Communication Patterns

- **User ↔ SPA**: HTTPS for secure web access
- **SPA ↔ API**: JSON over HTTPS with JWT tokens
- **API ↔ Database**: SQL queries via Sequelize ORM
- **API ↔ File System**: Direct file I/O operations
