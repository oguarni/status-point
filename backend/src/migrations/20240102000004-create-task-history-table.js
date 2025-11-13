'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TaskHistory', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      previous_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      new_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('TaskHistory', ['task_id'], {
      name: 'idx_task_history_task_id',
    });

    await queryInterface.addIndex('TaskHistory', ['user_id'], {
      name: 'idx_task_history_user_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('TaskHistory', 'idx_task_history_task_id');
    await queryInterface.removeIndex('TaskHistory', 'idx_task_history_user_id');
    await queryInterface.dropTable('TaskHistory');
  },
};
