# New Features Implemented

## Overview
Three major features have been added to the Task Management API:

1. **High Priority Tasks Due Within 7 Days** - Filter tasks by priority and due date
2. **Sorting by Due Date** - Sort tasks by multiple fields
3. **Role-Based Access Control** - Protect DONE tasks from normal user edits

---

## Feature 1: High Priority Tasks Due Within 7 Days

### Description
Filter tasks to find HIGH priority items that are due within the next 7 days.

### Query Parameter
- `highPriorityDueSoon=true` - Returns only HIGH priority tasks with due dates between now and 7 days from now

### Example
```bash
# Get all high priority tasks due soon
curl -X GET 'http://localhost:3000/api/tasks?highPriorityDueSoon=true'

# Combine with pagination
curl -X GET 'http://localhost:3000/api/tasks?highPriorityDueSoon=true&page=1&limit=10'
```

### Use Case
Perfect for daily standup meetings or dashboard widgets showing urgent tasks.

---

## Feature 2: Sorting by Due Date (and other fields)

### Description
Sort tasks by any of the following fields in ascending or descending order:
- `createdAt` - When the task was created
- `dueDate` - When the task is due
- `priority` - Task priority (HIGH > MEDIUM > LOW)
- `title` - Task title (alphabetical)

### Query Parameters
- `sortBy` - Field to sort by (createdAt, dueDate, priority, title)
- `sortOrder` - Order direction (asc or desc, default: asc)

### Examples
```bash
# Sort by due date (ascending - earliest first)
curl -X GET 'http://localhost:3000/api/tasks?sortBy=dueDate&sortOrder=asc'

# Sort by due date (descending - latest first)
curl -X GET 'http://localhost:3000/api/tasks?sortBy=dueDate&sortOrder=desc'

# Sort by priority (HIGH to LOW)
curl -X GET 'http://localhost:3000/api/tasks?sortBy=priority&sortOrder=desc'

# Sort by title alphabetically
curl -X GET 'http://localhost:3000/api/tasks?sortBy=title&sortOrder=asc'

# Combine with filters - HIGH priority tasks sorted by due date
curl -X GET 'http://localhost:3000/api/tasks?priority=HIGH&sortBy=dueDate&sortOrder=asc'

# Complete example with all options
curl -X GET 'http://localhost:3000/api/tasks?status=TODO&priority=HIGH&sortBy=dueDate&sortOrder=asc&page=1&limit=20'
```

---

## Feature 3: Role-Based Access Control for DONE Tasks

### Description
Protects completed (DONE) tasks from being modified by normal users while allowing admins full control.

### Rules
- **ADMIN Role**: Can edit any task including DONE tasks (all fields)
- **USER Role**: 
  - ✅ Can edit TODO and IN_PROGRESS tasks (all fields)
  - ✅ Can update priority on DONE tasks
  - ❌ Cannot edit title, description, status, or due date on DONE tasks

### Authentication
Use custom headers for authentication (in production, replace with JWT tokens):
- `x-user-role` - User role (ADMIN or USER) - **REQUIRED**
- `x-user-id` - User identifier (optional)

### Examples

#### As Normal User - Successful Operations
```bash
# Create a task (no auth required for POST)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task for demonstration",
    "priority": "MEDIUM"
  }'

# Update TODO/IN_PROGRESS task (allowed for USER)
curl -X PUT http://localhost:3000/api/tasks/{task-id} \
  -H "Content-Type: application/json" \
  -H "x-user-role: USER" \
  -d '{
    "title": "Updated Task",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2026-12-31T23:59:59Z"
  }'

# Update priority on DONE task (allowed for USER)
curl -X PATCH http://localhost:3000/api/tasks/{done-task-id} \
  -H "Content-Type: application/json" \
  -H "x-user-role: USER" \
  -d '{
    "priority": "LOW"
  }'
```

#### As Normal User - Forbidden Operations (403 Error)
```bash
# Try to edit DONE task status (FORBIDDEN for USER)
curl -X PATCH http://localhost:3000/api/tasks/{done-task-id} \
  -H "Content-Type: application/json" \
  -H "x-user-role: USER" \
  -d '{
    "status": "TODO"
  }'
# Response: 403 Forbidden - "Normal users cannot edit DONE tasks. Only priority can be updated."

# Try to edit DONE task title (FORBIDDEN for USER)
curl -X PUT http://localhost:3000/api/tasks/{done-task-id} \
  -H "Content-Type: application/json" \
  -H "x-user-role: USER" \
  -d '{
    "title": "New Title",
    "description": "New description",
    "status": "DONE",
    "priority": "HIGH"
  }'
# Response: 403 Forbidden
```

#### As Admin - All Operations Allowed
```bash
# Admin can edit DONE task completely
curl -X PUT http://localhost:3000/api/tasks/{done-task-id} \
  -H "Content-Type: application/json" \
  -H "x-user-role: ADMIN" \
  -d '{
    "title": "Reopened Task",
    "description": "Admin reopened this task",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-03-01T23:59:59Z"
  }'
# Response: 200 OK - Task updated successfully

# Admin can change DONE task back to IN_PROGRESS
curl -X PATCH http://localhost:3000/api/tasks/{done-task-id} \
  -H "Content-Type: application/json" \
  -H "x-user-role: ADMIN" \
  -H "x-user-id: admin-123" \
  -d '{
    "status": "IN_PROGRESS"
  }'
# Response: 200 OK
```

### Error Messages
- **401 Unauthorized**: `Authentication required. Please provide x-user-role header (ADMIN or USER)`
- **403 Forbidden**: `Normal users cannot edit DONE tasks. Only priority can be updated. Contact an admin for other changes.`

---

## Combined Feature Examples

### Example 1: Find HIGH priority tasks due soon, sorted by due date
```bash
curl -X GET 'http://localhost:3000/api/tasks?highPriorityDueSoon=true&sortBy=dueDate&sortOrder=asc'
```

### Example 2: User updates task priority before it's marked DONE
```bash
# Step 1: Create task
TASK_ID=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Meeting",
    "description": "Prepare presentation for quarterly review",
    "priority": "MEDIUM",
    "dueDate": "2026-02-25T10:00:00Z"
  }' | jq -r '.data.id')

# Step 2: User updates priority (allowed)
curl -X PATCH http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "x-user-role: USER" \
  -d '{"priority": "HIGH"}'

# Step 3: User marks as DONE (allowed)
curl -X PATCH http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "x-user-role: USER" \
  -d '{"status": "DONE"}'

# Step 4: User tries to reopen (FORBIDDEN)
curl -X PATCH http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "x-user-role: USER" \
  -d '{"status": "TODO"}'
# Error: 403 Forbidden

# Step 5: Admin reopens the task (allowed)
curl -X PATCH http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "x-user-role: ADMIN" \
  -d '{"status": "TODO"}'
# Success: 200 OK
```

---

## Testing with Swagger UI

All features are documented in Swagger UI at: `http://localhost:3000/api-docs`

### Using Authentication in Swagger
1. Open Swagger UI
2. Click the "Authorize" button (lock icon)
3. Enter your role: `ADMIN` or `USER`
4. Click "Authorize" then "Close"
5. All authenticated requests will include the `x-user-role` header

---

## API Endpoints Requiring Authentication

| Method | Endpoint | Auth Required | Admin Only |
|--------|----------|---------------|------------|
| GET | `/api/tasks` | No | No |
| GET | `/api/tasks/:id` | No | No |
| POST | `/api/tasks` | No | No |
| PUT | `/api/tasks/:id` | **Yes** | No* |
| PATCH | `/api/tasks/:id` | **Yes** | No* |
| DELETE | `/api/tasks/:id` | **Yes** | No |
| DELETE | `/api/tasks` | **Yes** | Recommended |

*Normal users have restricted access to DONE tasks

---

## Technical Implementation

### New Files Created
- `src/models/user.model.ts` - User role enum and interfaces
- `src/middleware/auth.ts` - Authentication and authorization middleware

### Modified Files
- `src/repositories/task.repository.ts` - Added sorting and highPriorityDueSoon filter
- `src/services/task.service.ts` - Added role-based validation for DONE tasks
- `src/controllers/task.controller.ts` - Pass user role to service layer
- `src/validators/task.validator.ts` - Added sortBy and sortOrder validation
- `src/routes/task.routes.ts` - Added authentication middleware
- `src/config/swagger.ts` - Added security scheme for API key auth

### Key Logic
```typescript
// Repository: High priority tasks due within 7 days
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

// Service: DONE task protection
if (existingTask.status === TaskStatus.DONE && userRole === UserRole.USER) {
  if (dto.status !== undefined || dto.title !== undefined || 
      dto.description !== undefined || dto.dueDate !== undefined) {
    throw new ForbiddenError('Normal users cannot edit DONE tasks. Only priority can be updated.');
  }
}
```

---

## Start the Server
```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/api/health`
