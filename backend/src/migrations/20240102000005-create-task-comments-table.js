'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TaskComments', {
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
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('TaskComments', ['task_id'], {
      name: 'idx_task_comments_task_id',
    });

    await queryInterface.addIndex('TaskComments', ['user_id'], {
      name: 'idx_task_comments_user_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('TaskComments', 'idx_task_comments_task_id');
    await queryInterface.removeIndex('TaskComments', 'idx_task_comments_user_id');
    await queryInterface.dropTable('TaskComments');
  },
};
