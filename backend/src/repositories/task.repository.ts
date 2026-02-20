import { Task, TaskStatus, TaskPriority } from '../models/task.model';

export type SortField = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  highPriorityDueSoon?: boolean; // Tasks with HIGH priority due within 7 days
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TaskRepository {
  private tasks: Task[] = [];

  /**
   * Find all tasks with optional filtering, sorting, and pagination
   */
  async findAll(
    filters?: TaskFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedResult<Task>> {
    let filteredTasks = [...this.tasks];

    // Apply filters
    if (filters?.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    if (filters?.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Filter for high priority tasks due within 7 days
    if (filters?.highPriorityDueSoon) {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      filteredTasks = filteredTasks.filter(task => {
        if (task.priority !== TaskPriority.HIGH || !task.dueDate) {
          return false;
        }
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        return dueDate >= now && dueDate <= sevenDaysFromNow;
      });
    }

    // Apply sorting
    if (sort?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = sort;
      filteredTasks.sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];

        // Handle date fields
        if (sortBy === 'createdAt' || sortBy === 'dueDate') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        // Handle priority (HIGH > MEDIUM > LOW)
        if (sortBy === 'priority') {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue = priorityOrder[aValue as TaskPriority] || 0;
          bValue = priorityOrder[bValue as TaskPriority] || 0;
        }

        // Handle string fields
        if (sortBy === 'title') {
          aValue = (aValue || '').toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = filteredTasks.length;

    // Apply pagination
    if (pagination) {
      const { page, limit } = pagination;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      filteredTasks = filteredTasks.slice(startIndex, endIndex);

      return {
        data: filteredTasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    return {
      data: filteredTasks,
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1
      }
    };
  }

  /**
   * Find a task by ID
   */
  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === id);
    return task || null;
  }

  /**
   * Create a new task
   */
  async create(task: Task): Promise<Task> {
    this.tasks.push(task);
    return task;
  }

  /**
   * Update a task
   */
  async update(id: string, updatedTask: Task): Promise<Task | null> {
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      return null;
    }

    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  /**
   * Delete a task by ID
   */
  async delete(id: string): Promise<Task | null> {
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      return null;
    }

    const deletedTask = this.tasks[index];
    this.tasks.splice(index, 1);
    return deletedTask;
  }

  /**
   * Delete all tasks
   */
  async deleteAll(): Promise<number> {
    const count = this.tasks.length;
    this.tasks = [];
    return count;
  }

  /**
   * Check if a task exists
   */
  async exists(id: string): Promise<boolean> {
    return this.tasks.some(t => t.id === id);
  }

  /**
   * Count tasks with optional filters
   */
  async count(filters?: TaskFilters): Promise<number> {
    let filteredTasks = [...this.tasks];

    if (filters?.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    if (filters?.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    return filteredTasks.length;
  }
}

// Singleton instance
export const taskRepository = new TaskRepository();
