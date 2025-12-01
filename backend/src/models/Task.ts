import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import User from './User';
import Project from './Project';

// Task attributes interface
interface TaskAttributes {
  id: number;
  user_id: number;
  project_id: number | null;
  assignee_id: number | null;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high' | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Optional fields for creation
interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'project_id' | 'assignee_id' | 'description' | 'status' | 'priority' | 'due_date' | 'created_at' | 'updated_at'> {}

// Task model class
class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public user_id!: number;
  public project_id!: number | null;
  public assignee_id!: number | null;
  public title!: string;
  public description!: string | null;
  public status!: 'pending' | 'completed';
  public priority!: 'low' | 'medium' | 'high' | null;
  public due_date!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Task model
export const initTaskModel = (sequelize: Sequelize): typeof Task => {
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Projects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assignee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'completed']],
        },
      },
      priority: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isIn: [['low', 'medium', 'high']],
        },
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'Tasks',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['user_id'],
          name: 'idx_tasks_user_id',
        },
        {
          fields: ['project_id'],
          name: 'idx_tasks_project_id',
        },
      ],
    }
  );

  return Task;
};

// Define associations
export const associateTask = (): void => {
  Task.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  Task.belongsTo(User, {
    foreignKey: 'assignee_id',
    as: 'assignee',
  });
  Task.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project',
  });
};

export default Task;
