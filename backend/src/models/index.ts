import { Sequelize } from 'sequelize';
import { initUserModel } from './User';
import { initTaskModel, associateTask } from './Task';
import { initProjectModel, associateProject } from './Project';
import { initTaskHistoryModel, associateTaskHistory } from './TaskHistory';

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
const TaskHistory = initTaskHistoryModel(sequelize);

// Define associations
User.hasMany(Task, {
  foreignKey: 'user_id',
  as: 'tasks',
});
User.hasMany(Project, {
  foreignKey: 'gestor_id',
  as: 'projects',
});
User.hasMany(TaskHistory, {
  foreignKey: 'user_id',
  as: 'taskHistories',
});
Project.hasMany(Task, {
  foreignKey: 'project_id',
  as: 'tasks',
});
Task.hasMany(TaskHistory, {
  foreignKey: 'task_id',
  as: 'history',
});
associateTask();
associateProject();
associateTaskHistory();

// Export models and sequelize instance
export { sequelize, User, Task, Project, TaskHistory };
