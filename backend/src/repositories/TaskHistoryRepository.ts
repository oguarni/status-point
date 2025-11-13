import { TaskHistory as TaskHistoryModel } from '../models';
import { TaskHistory } from '../domain/entities/TaskHistory';
import { TaskHistoryMapper } from '../mappers/TaskHistoryMapper';
import { CreateTaskHistoryDTO } from '../interfaces/ITaskHistoryRepository';

class TaskHistoryRepository {
  async create(data: CreateTaskHistoryDTO): Promise<TaskHistory> {
    try {
      const history = await TaskHistoryModel.create(data);
      return TaskHistoryMapper.toDomain(history);
    } catch (error) {
      throw new Error(`Error creating task history: ${error}`);
    }
  }

  async findByTaskId(taskId: number): Promise<TaskHistory[]> {
    try {
      const histories = await TaskHistoryModel.findAll({
        where: { task_id: taskId },
        order: [['created_at', 'DESC']],
      });
      return TaskHistoryMapper.toDomainList(histories);
    } catch (error) {
      throw new Error(`Error finding task history: ${error}`);
    }
  }
}

export default TaskHistoryRepository;
