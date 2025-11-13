'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TaskAttachments', {
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
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      filepath: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      filesize: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('TaskAttachments', ['task_id'], {
      name: 'idx_task_attachments_task_id',
    });

    await queryInterface.addIndex('TaskAttachments', ['user_id'], {
      name: 'idx_task_attachments_user_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('TaskAttachments', 'idx_task_attachments_task_id');
    await queryInterface.removeIndex('TaskAttachments', 'idx_task_attachments_user_id');
    await queryInterface.dropTable('TaskAttachments');
  },
};
