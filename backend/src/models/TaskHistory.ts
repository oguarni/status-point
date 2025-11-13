import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import Task from './Task';
import User from './User';

// TaskHistory attributes interface
interface TaskHistoryAttributes {
  id: number;
  task_id: number;
  user_id: number;
  previous_status: 'pending' | 'completed' | null;
  new_status: 'pending' | 'completed';
  created_at: Date;
}

// Optional fields for creation
interface TaskHistoryCreationAttributes extends Optional<TaskHistoryAttributes, 'id' | 'created_at'> {}

// TaskHistory model class
class TaskHistory extends Model<TaskHistoryAttributes, TaskHistoryCreationAttributes> implements TaskHistoryAttributes {
  public id!: number;
  public task_id!: number;
  public user_id!: number;
  public previous_status!: 'pending' | 'completed' | null;
  public new_status!: 'pending' | 'completed';
  public created_at!: Date;

  // Timestamp
  public readonly createdAt!: Date;
}

// Initialize TaskHistory model
export const initTaskHistoryModel = (sequelize: Sequelize): typeof TaskHistory => {
  TaskHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      previous_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isIn: [['pending', 'completed']],
        },
      },
      new_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [['pending', 'completed']],
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'TaskHistory',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          fields: ['task_id'],
          name: 'idx_task_history_task_id',
        },
        {
          fields: ['user_id'],
          name: 'idx_task_history_user_id',
        },
      ],
    }
  );

  return TaskHistory;
};

// Define associations
export const associateTaskHistory = (): void => {
  TaskHistory.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task',
  });
  TaskHistory.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

export default TaskHistory;
