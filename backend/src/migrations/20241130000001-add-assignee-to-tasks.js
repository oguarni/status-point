'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'assignee_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      after: 'user_id',
    });

    // Add index for assignee_id column
    await queryInterface.addIndex('Tasks', ['assignee_id'], {
      name: 'idx_tasks_assignee_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Tasks', 'idx_tasks_assignee_id');
    await queryInterface.removeColumn('Tasks', 'assignee_id');
  },
};
