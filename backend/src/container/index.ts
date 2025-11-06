import 'reflect-metadata';
import { Container } from 'inversify';
import { ITaskRepository } from '../interfaces/ITaskRepository';
import { IUserRepository } from '../interfaces/IUserRepository';
import { ITaskService } from '../interfaces/ITaskService';
import { IAuthService } from '../interfaces/IAuthService';
import { ILogger } from '../utils/logger';
import TaskRepository from '../repositories/TaskRepository';
import UserRepository from '../repositories/UserRepository';
import TaskService from '../services/TaskService';
import AuthService from '../services/AuthService';
import { ConsoleLogger } from '../utils/logger';
import { CreateTaskUseCase } from '../usecases/CreateTaskUseCase';
import { UpdateTaskUseCase } from '../usecases/UpdateTaskUseCase';
import { DeleteTaskUseCase } from '../usecases/DeleteTaskUseCase';
import { GetTasksUseCase } from '../usecases/GetTasksUseCase';

// Dependency injection container
const container = new Container();

// Bind repositories
container.bind<ITaskRepository>('TaskRepository').to(TaskRepository as any).inSingletonScope();
container.bind<IUserRepository>('UserRepository').to(UserRepository as any).inSingletonScope();

// Bind services
container.bind<ITaskService>('TaskService').to(TaskService as any).inSingletonScope();
container.bind<IAuthService>('AuthService').to(AuthService as any).inSingletonScope();

// Bind logger factory
container.bind<ILogger>('Logger').toDynamicValue(() => {
  return new ConsoleLogger('App');
});

// Bind use cases
container.bind<CreateTaskUseCase>('CreateTaskUseCase').to(CreateTaskUseCase as any);
container.bind<UpdateTaskUseCase>('UpdateTaskUseCase').to(UpdateTaskUseCase as any);
container.bind<DeleteTaskUseCase>('DeleteTaskUseCase').to(DeleteTaskUseCase as any);
container.bind<GetTasksUseCase>('GetTasksUseCase').to(GetTasksUseCase as any);

export { container };
