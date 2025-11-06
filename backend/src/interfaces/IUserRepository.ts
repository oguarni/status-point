import { User } from '../domain/entities/User';

// DTOs
export interface CreateUserDTO {
  name: string;
  email: string;
  password_hash: string;
}

// Repository Interface
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}
