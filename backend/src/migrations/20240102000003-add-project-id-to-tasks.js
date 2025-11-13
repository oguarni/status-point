'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      after: 'user_id',
    });

    // Add index for project_id column
    await queryInterface.addIndex('Tasks', ['project_id'], {
      name: 'idx_tasks_project_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Tasks', 'idx_tasks_project_id');
    await queryInterface.removeColumn('Tasks', 'project_id');
  },
};
