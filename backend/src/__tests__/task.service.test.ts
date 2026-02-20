import { TaskService } from '../services/task.service';
import { taskRepository } from '../repositories/task.repository';
import { TaskStatus, TaskPriority } from '../models/task.model';
import { NotFoundError } from '../utils/errors';

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    // Clear repository before each test
    (taskRepository as any).tasks = [];
  });

  describe('createTask', () => {
    it('should create a task with all fields', async () => {
      const dto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: '2026-12-31T23:59:59Z'
      };

      const task = await taskService.createTask(dto);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.dueDate).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should create a task with default values', async () => {
      const dto = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const task = await taskService.createTask(dto);

      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(TaskPriority.MEDIUM);
      expect(task.dueDate).toBeUndefined();
    });

    it('should trim title and description', async () => {
      const dto = {
        title: '  Test Task  ',
        description: '  Test Description  '
      };

      const task = await taskService.createTask(dto);

      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
    });
  });

  describe('getTaskById', () => {
    it('should return a task when it exists', async () => {
      const created = await taskService.createTask({
        title: 'Test Task',
        description: 'Test Description'
      });

      const task = await taskService.getTaskById(created.id);

      expect(task).toBeDefined();
      expect(task.id).toBe(created.id);
    });

    it('should throw NotFoundError when task does not exist', async () => {
      await expect(
        taskService.getTaskById('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllTasks', () => {
    beforeEach(async () => {
      await taskService.createTask({
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH
      });
      await taskService.createTask({
        title: 'Task 2',
        description: 'Description 2',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM
      });
      await taskService.createTask({
        title: 'Task 3',
        description: 'Description 3',
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW
      });
    });

    it('should return all tasks without filters', async () => {
      const result = await taskService.getAllTasks();

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.getAllTasks({ status: TaskStatus.TODO });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(TaskStatus.TODO);
    });

    it('should filter tasks by priority', async () => {
      const result = await taskService.getAllTasks({ priority: TaskPriority.HIGH });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].priority).toBe(TaskPriority.HIGH);
    });

    it('should paginate tasks', async () => {
      const result = await taskService.getAllTasks(undefined, { page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const created = await taskService.createTask({
        title: 'Original Title',
        description: 'Original Description'
      });

      const updated = await taskService.updateTask(created.id, {
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
      expect(updated.description).toBe('Original Description');
    });

    it('should throw NotFoundError when updating non-existent task', async () => {
      await expect(
        taskService.updateTask('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const created = await taskService.createTask({
        title: 'Test Task',
        description: 'Test Description'
      });

      const deleted = await taskService.deleteTask(created.id);

      expect(deleted.id).toBe(created.id);

      await expect(
        taskService.getTaskById(created.id)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when deleting non-existent task', async () => {
      await expect(
        taskService.deleteTask('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAllTasks', () => {
    it('should delete all tasks', async () => {
      await taskService.createTask({ title: 'Task 1', description: 'Desc 1' });
      await taskService.createTask({ title: 'Task 2', description: 'Desc 2' });

      const count = await taskService.deleteAllTasks();

      expect(count).toBe(2);

      const result = await taskService.getAllTasks();
      expect(result.data).toHaveLength(0);
    });
  });
});
