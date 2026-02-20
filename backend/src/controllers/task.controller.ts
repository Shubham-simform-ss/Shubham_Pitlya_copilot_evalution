import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { TaskStatus, TaskPriority } from '../models/task.model';
import { SortField, SortOrder } from '../repositories/task.repository';

/**
 * Get all tasks with optional filtering, sorting, and pagination
 */
export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority, highPriorityDueSoon, sortBy, sortOrder, page, limit } = req.query;

    const filters = {
      ...(status && { status: status as TaskStatus }),
      ...(priority && { priority: priority as TaskPriority }),
      ...(highPriorityDueSoon && { highPriorityDueSoon: highPriorityDueSoon === 'true' })
    };

    const pagination = page && limit ? {
      page: Number(page),
      limit: Number(limit)
    } : undefined;

    const sort = sortBy ? {
      sortBy: sortBy as SortField,
      sortOrder: (sortOrder as SortOrder) || 'asc'
    } : undefined;

    const result = await taskService.getAllTasks(filters, pagination, sort);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a task by ID
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 */
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.createTask(req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task (full update)
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await taskService.updateTask(id, req.body, req.user?.role);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Partially update a task
 */
export const patchTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await taskService.patchTask(id, req.body, req.user?.role);

    res.status(200).json({
      success: true,
      message: 'Task partially updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTask = await taskService.deleteTask(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all tasks
 */
export const deleteAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await taskService.deleteAllTasks();

    res.status(200).json({
      success: true,
      message: `Deleted ${count} task(s)`,
      count
    });
  } catch (error) {
    next(error);
  }
};
