import { User, UserRole } from '../domain/entities/User';
import UserModel from '../models/User';

// UserAttributes for mapping back to model
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/**
 * Mapper to convert between User domain entities and Sequelize models
 */
export class UserMapper {
  /**
   * Convert Sequelize User model to domain entity
   * @param model - Sequelize User model
   * @returns User domain entity
   */
  static toDomain(model: UserModel): User {
    return new User(
      model.id,
      model.name,
      model.email,
      model.password_hash,
      model.role,
      model.created_at,
      model.updated_at
    );
  }

  /**
   * Convert User domain entity to Sequelize model attributes
   * @param entity - User domain entity
   * @returns User attributes for Sequelize model
   */
  static toModel(entity: User): UserAttributes {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password_hash: entity.passwordHash,
      role: entity.role,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  /**
   * Convert array of Sequelize User models to domain entities
   * @param models - Array of Sequelize User models
   * @returns Array of User domain entities
   */
  static toDomainList(models: UserModel[]): User[] {
    return models.map((model) => this.toDomain(model));
  }
}
