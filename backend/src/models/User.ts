import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

// User attributes interface
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'gestor' | 'colaborador';
  created_at: Date;
  updated_at: Date;
}

// Optional fields for creation (id, timestamps are auto-generated)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password_hash!: string;
  public role!: 'admin' | 'gestor' | 'colaborador';
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize User model
export const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'colaborador',
        validate: {
          isIn: [['admin', 'gestor', 'colaborador']],
        },
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
      tableName: 'Users',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        // Hash password before creating user
        beforeCreate: async (user: User) => {
          if (user.password_hash) {
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(user.password_hash, salt);
          }
        },
      },
    }
  );

  return User;
};

export default User;
