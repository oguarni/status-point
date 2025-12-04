'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add new temporary status column
    await queryInterface.addColumn('Tasks', 'new_status', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // Step 2: Migrate existing data
    // 'pending' -> 'todo'
    await queryInterface.sequelize.query(`
      UPDATE "Tasks" SET new_status = 'todo' WHERE status = 'pending';
    `);

    // 'completed' -> 'completed' (stays the same)
    await queryInterface.sequelize.query(`
      UPDATE "Tasks" SET new_status = 'completed' WHERE status = 'completed';
    `);

    // Step 3: Drop old status column
    await queryInterface.removeColumn('Tasks', 'status');

    // Step 4: Rename new_status to status
    await queryInterface.renameColumn('Tasks', 'new_status', 'status');

    // Step 5: Update column to NOT NULL with default value
    await queryInterface.changeColumn('Tasks', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'todo',
    });

    // Step 6: Add CHECK constraint for PostgreSQL
    await queryInterface.sequelize.query(`
      ALTER TABLE "Tasks" ADD CONSTRAINT "check_task_status"
      CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked'));
    `);

    console.log('✓ Successfully migrated task statuses: pending -> todo');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove CHECK constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "check_task_status";
    `);

    // Add temporary column for rollback
    await queryInterface.addColumn('Tasks', 'old_status', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // Migrate statuses back to old values
    // 'todo', 'in_progress', 'blocked' -> 'pending'
    // 'completed' -> 'completed'
    await queryInterface.sequelize.query(`
      UPDATE "Tasks" SET old_status = CASE
        WHEN status IN ('todo', 'in_progress', 'blocked') THEN 'pending'
        WHEN status = 'completed' THEN 'completed'
        ELSE 'pending'
      END;
    `);

    // Drop new status column
    await queryInterface.removeColumn('Tasks', 'status');

    // Rename old_status to status
    await queryInterface.renameColumn('Tasks', 'old_status', 'status');

    // Restore original constraints
    await queryInterface.changeColumn('Tasks', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
    });

    console.log('✓ Rolled back task statuses: todo/in_progress/blocked -> pending');
  },
};
