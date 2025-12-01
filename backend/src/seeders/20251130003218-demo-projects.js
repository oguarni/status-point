'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Check if projects already exist
    const existingProjects = await queryInterface.sequelize.query(
      `SELECT title FROM "Projects" WHERE title IN ('E-Commerce Platform Redesign', 'Mobile App Development', 'Database Migration', 'Security Audit', 'Customer Portal')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingProjects.length > 0) {
      console.log('✓ Demo projects already exist');
      return;
    }

    // Get gestor user ID (should be 2)
    const gestorUser = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE role = 'gestor' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (gestorUser.length === 0) {
      console.log('⚠ No gestor user found. Skipping projects seeder.');
      return;
    }

    const gestorId = gestorUser[0].id;

    // Create demo projects with different statuses and deadlines
    const projects = [
      {
        title: 'E-Commerce Platform Redesign',
        description: 'Complete redesign of the e-commerce platform with modern UI/UX, improved performance, and new payment integrations. This project will involve frontend redesign, backend API updates, and database schema changes.',
        deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        gestor_id: gestorId,
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Mobile App Development',
        description: 'Development of iOS and Android mobile applications with React Native. Features include real-time notifications, offline support, and biometric authentication.',
        deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        gestor_id: gestorId,
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Database Migration',
        description: 'Migration from legacy MySQL database to PostgreSQL with zero downtime. Includes data migration scripts, testing procedures, and rollback plans.',
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now (urgent)
        gestor_id: gestorId,
        created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Security Audit',
        description: 'Comprehensive security audit of all systems, including penetration testing, code review, and compliance verification (GDPR, LGPD).',
        deadline: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (overdue)
        gestor_id: gestorId,
        created_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Customer Portal',
        description: 'New customer self-service portal with account management, order tracking, support tickets, and knowledge base integration.',
        deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        gestor_id: gestorId,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: now
      },
      {
        title: 'API Documentation Update',
        description: 'Update and improve API documentation with interactive examples using Swagger/OpenAPI. Include authentication guides and code samples in multiple languages.',
        deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        gestor_id: gestorId,
        created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Performance Optimization',
        description: 'System-wide performance improvements including database query optimization, caching implementation, CDN integration, and frontend bundle size reduction.',
        deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        gestor_id: gestorId,
        created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    await queryInterface.bulkInsert('Projects', projects, {});
    console.log(`✓ Inserted ${projects.length} demo projects`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Projects', {
      title: {
        [Sequelize.Op.in]: [
          'E-Commerce Platform Redesign',
          'Mobile App Development',
          'Database Migration',
          'Security Audit',
          'Customer Portal',
          'API Documentation Update',
          'Performance Optimization'
        ]
      }
    }, {});
  }
};
