'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedGestorPassword = await bcrypt.hash('gestor123', 10);
    const hashedColaboradorPassword = await bcrypt.hash('colaborador123', 10);

    // Check if users already exist
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT email FROM "Users" WHERE email IN ('admin@taskmanager.com', 'gestor@taskmanager.com', 'colaborador@taskmanager.com')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingEmails = new Set(existingUsers.map(u => u.email));

    const usersToInsert = [];

    if (!existingEmails.has('admin@taskmanager.com')) {
      usersToInsert.push({
        name: 'Admin User',
        email: 'admin@taskmanager.com',
        password_hash: hashedAdminPassword,
        role: 'admin',
        created_at: now,
        updated_at: now
      });
    }

    if (!existingEmails.has('gestor@taskmanager.com')) {
      usersToInsert.push({
        name: 'Gestor User',
        email: 'gestor@taskmanager.com',
        password_hash: hashedGestorPassword,
        role: 'gestor',
        created_at: now,
        updated_at: now
      });
    }

    if (!existingEmails.has('colaborador@taskmanager.com')) {
      usersToInsert.push({
        name: 'Colaborador User',
        email: 'colaborador@taskmanager.com',
        password_hash: hashedColaboradorPassword,
        role: 'colaborador',
        created_at: now,
        updated_at: now
      });
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('Users', usersToInsert, {});
      console.log(`✓ Inserted ${usersToInsert.length} demo user(s)`);
    } else {
      console.log('✓ All demo users already exist');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: {
        [Sequelize.Op.in]: [
          'admin@taskmanager.com',
          'gestor@taskmanager.com',
          'colaborador@taskmanager.com'
        ]
      }
    }, {});
  }
};
