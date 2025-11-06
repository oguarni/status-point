import { Sequelize } from 'sequelize';
import { initUserModel } from '../models/User';
import { initTaskModel } from '../models/Task';

// Create a test database instance using SQLite in memory
export const createTestDatabase = () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });

  // Initialize models for testing
  const User = initUserModel(sequelize);
  const Task = initTaskModel(sequelize);

  // Set up associations
  User.hasMany(Task, {
    foreignKey: 'user_id',
    as: 'tasks',
  });

  Task.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  return { sequelize, User, Task };
};

// Create a mock sequelize instance for app initialization
export const createMockSequelize = () => {
  return {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  };
};