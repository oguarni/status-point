import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import User from './User';

// Project attributes interface
interface ProjectAttributes {
  id: number;
  gestor_id: number;
  title: string;
  description: string | null;
  deadline: Date;
  created_at: Date;
  updated_at: Date;
}

// Optional fields for creation
interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'description' | 'created_at' | 'updated_at'> {}

// Project model class
class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public gestor_id!: number;
  public title!: string;
  public description!: string | null;
  public deadline!: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Project model
export const initProjectModel = (sequelize: Sequelize): typeof Project => {
  Project.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      gestor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: false,
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
      tableName: 'Projects',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['gestor_id'],
          name: 'idx_projects_gestor_id',
        },
        {
          fields: ['deadline'],
          name: 'idx_projects_deadline',
        },
      ],
    }
  );

  return Project;
};

// Define associations
export const associateProject = (): void => {
  Project.belongsTo(User, {
    foreignKey: 'gestor_id',
    as: 'gestor',
  });
};

export default Project;
