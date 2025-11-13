import { Sequelize } from 'sequelize';
import { initUserModel } from './User';
import { initTaskModel, associateTask } from './Task';
import { initProjectModel, associateProject } from './Project';

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
  }
);

// Initialize models
const User = initUserModel(sequelize);
const Task = initTaskModel(sequelize);
const Project = initProjectModel(sequelize);

// Define associations
User.hasMany(Task, {
  foreignKey: 'user_id',
  as: 'tasks',
});
User.hasMany(Project, {
  foreignKey: 'gestor_id',
  as: 'projects',
});
Project.hasMany(Task, {
  foreignKey: 'project_id',
  as: 'tasks',
});
associateTask();
associateProject();

// Export models and sequelize instance
export { sequelize, User, Task, Project };
