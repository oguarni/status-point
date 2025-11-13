'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'colaborador',
      after: 'password_hash',
    });

    // Add index for role column for better query performance
    await queryInterface.addIndex('Users', ['role'], {
      name: 'idx_users_role',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Users', 'idx_users_role');
    await queryInterface.removeColumn('Users', 'role');
  },
};
