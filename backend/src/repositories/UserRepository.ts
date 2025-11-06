import { User as UserModel } from '../models';
import { User } from '../domain/entities/User';
import { UserMapper } from '../mappers/UserMapper';
import { CreateUserDTO } from '../interfaces/IUserRepository';

// UserRepository class - Data Access Layer
class UserRepository {
  /**
   * Find a user by email
   * @param email - User's email address
   * @returns User domain entity or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({
        where: { email },
      });
      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error}`);
    }
  }

  /**
   * Find a user by ID
   * @param id - User's ID
   * @returns User domain entity or null if not found
   */
  async findById(id: number): Promise<User | null> {
    try {
      const user = await UserModel.findByPk(id);
      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error}`);
    }
  }

  /**
   * Create a new user
   * @param userData - User creation data
   * @returns Created user domain entity
   */
  async create(userData: CreateUserDTO): Promise<User> {
    try {
      const user = await UserModel.create(userData);
      return UserMapper.toDomain(user);
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }
}

export default UserRepository;
