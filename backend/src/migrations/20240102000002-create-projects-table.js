'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Projects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      gestor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deadline: {
        type: Sequelize.DATE,
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

    // Add indexes
    await queryInterface.addIndex('Projects', ['gestor_id'], {
      name: 'idx_projects_gestor_id',
    });

    await queryInterface.addIndex('Projects', ['deadline'], {
      name: 'idx_projects_deadline',
    });

    // Add unique constraint: gestor cannot have duplicate project titles
    await queryInterface.addIndex('Projects', ['gestor_id', 'title'], {
      name: 'idx_projects_gestor_title_unique',
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Projects', 'idx_projects_deadline');
    await queryInterface.removeIndex('Projects', 'idx_projects_gestor_id');
    await queryInterface.removeIndex('Projects', 'idx_projects_gestor_title_unique');
    await queryInterface.dropTable('Projects');
  },
};
