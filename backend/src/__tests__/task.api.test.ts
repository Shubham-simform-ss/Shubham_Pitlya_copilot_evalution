import request from 'supertest';
import app from '../app';
import { taskRepository } from '../repositories/task.repository';

describe('Task API Integration Tests', () => {
  beforeEach(() => {
    // Clear repository before each test
    (taskRepository as any).tasks = [];
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'New Task',
          description: 'Task Description',
          priority: 'HIGH'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Task');
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task without description'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task',
          description: 'Description',
          status: 'INVALID_STATUS'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await request(app).post('/api/tasks').send({
        title: 'Task 1',
        description: 'Description 1',
        status: 'TODO'
      });
      await request(app).post('/api/tasks').send({
        title: 'Task 2',
        description: 'Description 2',
        status: 'IN_PROGRESS'
      });
    });

    it('should get all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ status: 'TODO' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('TODO');
    });

    it('should paginate tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a task by id', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });

      const taskId = createResponse.body.data.id;

      const response = await request(app).get(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Original Task',
          description: 'Original Description'
        });

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'IN_PROGRESS'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Task');
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should partially update a task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Original Task',
          description: 'Original Description'
        });

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({
          status: 'DONE'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('DONE');
      expect(response.body.data.title).toBe('Original Task');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to Delete',
          description: 'Will be deleted'
        });

      const taskId = createResponse.body.data.id;

      const deleteResponse = await request(app).delete(`/api/tasks/${taskId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await request(app).get(`/api/tasks/${taskId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks', () => {
    it('should delete all tasks', async () => {
      await request(app).post('/api/tasks').send({
        title: 'Task 1',
        description: 'Description 1'
      });
      await request(app).post('/api/tasks').send({
        title: 'Task 2',
        description: 'Description 2'
      });

      const deleteResponse = await request(app).delete('/api/tasks');

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.count).toBe(2);

      const getResponse = await request(app).get('/api/tasks');
      expect(getResponse.body.data).toHaveLength(0);
    });
  });
});
