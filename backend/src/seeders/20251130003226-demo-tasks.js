'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Check if tasks already exist
    const existingTasks = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM "Tasks"`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingTasks[0].count > 0) {
      console.log('✓ Demo tasks already exist');
      return;
    }

    // Get user IDs
    const users = await queryInterface.sequelize.query(
      `SELECT id, role FROM "Users" ORDER BY id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('⚠ No users found. Skipping tasks seeder.');
      return;
    }

    const colaboradorId = users.find(u => u.role === 'colaborador')?.id || users[0].id;
    const gestorId = users.find(u => u.role === 'gestor')?.id || users[1]?.id;
    const adminId = users.find(u => u.role === 'admin')?.id || users[2]?.id;

    // Get project IDs
    const projects = await queryInterface.sequelize.query(
      `SELECT id, title FROM "Projects" ORDER BY id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const projectIds = projects.map(p => p.id);

    // Create comprehensive demo tasks for all users
    const tasks = [
      // ===== COLABORADOR TASKS =====
      // Tasks for E-Commerce Platform Redesign project
      {
        title: 'Design new homepage layout',
        description: 'Create wireframes and mockups for the new homepage design. Include mobile and desktop versions.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        user_id: colaboradorId,
        project_id: projectIds[0] || null,
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Implement payment gateway integration',
        description: 'Integrate Stripe and PayPal payment gateways with proper error handling and webhook support.',
        status: 'todo',
        priority: 'high',
        due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        user_id: colaboradorId,
        project_id: projectIds[0] || null,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Write unit tests for cart functionality',
        description: 'Create comprehensive unit tests for shopping cart operations including add, remove, update quantity, and checkout.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        user_id: colaboradorId,
        project_id: projectIds[0] || null,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },

      // Tasks for Mobile App Development project
      {
        title: 'Setup React Native project structure',
        description: 'Initialize React Native project with proper folder structure, navigation, and state management (Redux).',
        status: 'completed',
        priority: 'high',
        due_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        user_id: colaboradorId,
        project_id: projectIds[1] || null,
        created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Implement push notifications',
        description: 'Add Firebase Cloud Messaging for push notifications on iOS and Android with notification permissions handling.',
        status: 'todo',
        priority: 'high',
        due_date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        user_id: colaboradorId,
        project_id: projectIds[1] || null,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: 'Implement biometric authentication',
        description: 'Add fingerprint and face ID authentication for secure app access using React Native Biometrics.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        user_id: colaboradorId,
        project_id: projectIds[1] || null,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },

      // Personal tasks (no project)
      {
        title: 'Update personal profile information',
        description: 'Review and update personal contact information, bio, and profile picture.',
        status: 'completed',
        priority: 'low',
        due_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
        user_id: colaboradorId,
        project_id: null,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Review code for PR #342',
        description: 'Code review for authentication refactoring pull request. Check for security issues and best practices.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        user_id: colaboradorId,
        project_id: null,
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: 'Prepare presentation for team meeting',
        description: 'Create slides about recent performance improvements and optimization results.',
        status: 'todo',
        priority: 'low',
        due_date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        user_id: colaboradorId,
        project_id: null,
        created_at: now,
        updated_at: now
      },

      // ===== GESTOR TASKS =====
      {
        title: 'Review project requirements',
        description: 'Review and approve requirements documentation for all active projects. Schedule stakeholder meetings.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        user_id: gestorId,
        project_id: null,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Conduct team performance reviews',
        description: 'Schedule and conduct quarterly performance reviews for all team members. Prepare feedback and development plans.',
        status: 'todo',
        priority: 'high',
        due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        user_id: gestorId,
        project_id: null,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Approve budget allocation for Q2',
        description: 'Review and approve budget requests for all departments for Q2. Submit to finance by deadline.',
        status: 'todo',
        priority: 'high',
        due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        user_id: gestorId,
        project_id: null,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: 'Plan database migration strategy',
        description: 'Create detailed migration plan with timeline, resource allocation, and risk mitigation strategies.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        user_id: gestorId,
        project_id: projectIds[2] || null,
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Hire security consultant',
        description: 'Interview and hire external security consultant for comprehensive audit. Check credentials and references.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        user_id: gestorId,
        project_id: projectIds[3] || null,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Define customer portal requirements',
        description: 'Work with stakeholders to define detailed requirements for customer portal features and user flows.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        user_id: gestorId,
        project_id: projectIds[4] || null,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updated_at: now
      },

      // ===== ADMIN TASKS =====
      {
        title: 'Configure production server infrastructure',
        description: 'Setup and configure production servers on AWS with auto-scaling, load balancing, and monitoring.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        user_id: adminId,
        project_id: null,
        created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Implement backup and disaster recovery',
        description: 'Setup automated backups, disaster recovery procedures, and test restoration process.',
        status: 'todo',
        priority: 'high',
        due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        user_id: adminId,
        project_id: null,
        created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure Jenkins/GitHub Actions for automated testing, building, and deployment to staging and production.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        user_id: adminId,
        project_id: null,
        created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Review and update security policies',
        description: 'Review all security policies, update password requirements, implement 2FA, and create security training materials.',
        status: 'todo',
        priority: 'high',
        due_date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        user_id: adminId,
        project_id: projectIds[3] || null,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Optimize database queries',
        description: 'Analyze slow queries, add missing indexes, optimize query plans, and implement query caching.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        user_id: adminId,
        project_id: projectIds[6] || null,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Setup monitoring and alerting',
        description: 'Configure Grafana/Prometheus for system monitoring, create dashboards, and setup alert notifications.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        user_id: adminId,
        project_id: null,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: 'Conduct security audit',
        description: 'Perform comprehensive security audit including vulnerability scanning, penetration testing, and compliance checks.',
        status: 'todo',
        priority: 'high',
        due_date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        user_id: adminId,
        project_id: projectIds[3] || null,
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Implement API rate limiting',
        description: 'Add rate limiting to all API endpoints to prevent abuse. Configure different limits for authenticated vs public endpoints.',
        status: 'completed',
        priority: 'medium',
        due_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        user_id: adminId,
        project_id: projectIds[5] || null,
        created_at: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },

      // More varied tasks
      {
        title: 'Fix login page responsive design',
        description: 'Login page has layout issues on mobile devices. Fix CSS and test on various screen sizes.',
        status: 'todo',
        priority: 'low',
        due_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        user_id: colaboradorId,
        project_id: null,
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: 'Update dependencies to latest versions',
        description: 'Review and update all npm packages to latest stable versions. Test for breaking changes.',
        status: 'todo',
        priority: 'low',
        due_date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        user_id: adminId,
        project_id: null,
        created_at: now,
        updated_at: now
      },
      {
        title: 'Create user onboarding flow',
        description: 'Design and implement user onboarding tutorial for new users with interactive walkthroughs.',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        user_id: colaboradorId,
        project_id: projectIds[4] || null,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('Tasks', tasks, {});
    console.log(`✓ Inserted ${tasks.length} demo tasks`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
  }
};
