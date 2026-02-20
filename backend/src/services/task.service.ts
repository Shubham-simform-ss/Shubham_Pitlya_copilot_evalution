import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../models/task.model';
import { UserRole } from '../models/user.model';
import { taskRepository, TaskFilters, PaginationOptions, PaginatedResult, SortOptions } from '../repositories/task.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class TaskService {
  /**
   * Get all tasks with optional filters, pagination, and sorting
   */
  async getAllTasks(
    filters?: TaskFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedResult<Task>> {
    return await taskRepository.findAll(filters, pagination, sort);
  }

  /**
   * Get a task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const task = await taskRepository.findById(id);
    
    if (!task) {
      throw new NotFoundError('Task', id);
    }

    return task;
  }

  /**
   * Create a new task
   */
  async createTask(dto: CreateTaskDto): Promise<Task> {
    const newTask: Task = {
      id: uuidv4(),
      title: dto.title.trim(),
      description: dto.description.trim(),
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await taskRepository.create(newTask);
  }

  /**
   * Update a task (full update - PUT)
   * Normal users cannot edit DONE tasks (except priority), but admins can
   */
  async updateTask(id: string, dto: UpdateTaskDto, userRole?: UserRole): Promise<Task> {
    const existingTask = await this.getTaskById(id);

    // Check if task is DONE and user is not admin
    if (existingTask.status === TaskStatus.DONE && userRole === UserRole.USER) {
      // Normal users can only update priority of DONE tasks
      if (dto.status !== undefined || dto.title !== undefined || 
          dto.description !== undefined || dto.dueDate !== undefined) {
        throw new ForbiddenError('Normal users cannot edit DONE tasks. Only priority can be updated. Contact an admin for other changes.');
      }
    }

    const updatedTask: Task = {
      ...existingTask,
      title: dto.title !== undefined ? dto.title.trim() : existingTask.title,
      description: dto.description !== undefined ? dto.description.trim() : existingTask.description,
      status: dto.status !== undefined ? dto.status : existingTask.status,
      priority: dto.priority !== undefined ? dto.priority : existingTask.priority,
      dueDate: dto.dueDate !== undefined ? new Date(dto.dueDate) : existingTask.dueDate,
      updatedAt: new Date()
    };

    const result = await taskRepository.update(id, updatedTask);
    
    if (!result) {
      throw new NotFoundError('Task', id);
    }

    return result;
  }

  /**
   * Partially update a task (PATCH)
   * Normal users cannot edit DONE tasks (except priority), but admins can
   */
  async patchTask(id: string, dto: UpdateTaskDto, userRole?: UserRole): Promise<Task> {
    const existingTask = await this.getTaskById(id);

    // Check if task is DONE and user is not admin
    if (existingTask.status === TaskStatus.DONE && userRole === UserRole.USER) {
      // Normal users can only update priority of DONE tasks
      if (dto.status !== undefined || dto.title !== undefined || 
          dto.description !== undefined || dto.dueDate !== undefined) {
        throw new ForbiddenError('Normal users cannot edit DONE tasks. Only priority can be updated. Contact an admin for other changes.');
      }
    }

    const updatedTask: Task = {
      ...existingTask,
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
      updatedAt: new Date()
    };

    const result = await taskRepository.update(id, updatedTask);
    
    if (!result) {
      throw new NotFoundError('Task', id);
    }

    return result;
  }

  /**
   * Delete a task by ID
   */
  async deleteTask(id: string): Promise<Task> {
    const deletedTask = await taskRepository.delete(id);
    
    if (!deletedTask) {
      throw new NotFoundError('Task', id);
    }

    return deletedTask;
  }

  /**
   * Delete all tasks
   */
  async deleteAllTasks(): Promise<number> {
    return await taskRepository.deleteAll();
  }

  /**
   * Check if a task exists
   */
  async taskExists(id: string): Promise<boolean> {
    return await taskRepository.exists(id);
  }

  /**
   * Get task count with optional filters
   */
  async getTaskCount(filters?: TaskFilters): Promise<number> {
    return await taskRepository.count(filters);
  }
}

// Singleton instance
export const taskService = new TaskService();
