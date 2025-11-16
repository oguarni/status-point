# C4 Model - Level 1: System Context Diagram

## Agiliza Task Management System

This diagram shows the high-level system context of the Agiliza Task Management System and its interactions with users and external systems.

```mermaid
C4Context
    title System Context Diagram for Agiliza Task Management

    Person(admin, "Administrator", "Manages users, projects, and system configuration")
    Person(gestor, "Manager", "Manages projects and team tasks")
    Person(colaborador, "Developer", "Creates and manages personal tasks")

    System(agiliza, "Agiliza Task Management System", "Provides task tracking, project management, and team collaboration capabilities with role-based access control")

    System_Ext(email, "Email System", "Sends notifications and alerts")
    SystemDb_Ext(storage, "File Storage", "Stores task attachments")

    Rel(admin, agiliza, "Manages users and projects")
    Rel(gestor, agiliza, "Manages projects and tasks")
    Rel(colaborador, agiliza, "Creates and updates tasks")

    Rel(agiliza, email, "Sends notifications", "SMTP")
    Rel(agiliza, storage, "Stores/retrieves files", "File System")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Key Elements

- **Users**: Three role-based actors (Administrator, Manager, Developer)
- **Agiliza System**: Central task management platform
- **External Systems**:
  - Email System: For notifications (future enhancement)
  - File Storage: For task attachments

### Interactions

- Administrators manage users, projects, and system configuration
- Managers oversee projects and assign tasks to team members
- Developers create and track their own tasks
- The system integrates with external services for notifications and file storage
