# Mock API for Frontend-Only Candidates

This folder provides a mock REST API using **json-server** for frontend-only candidates. It simulates a real backend without requiring you to implement the actual backend logic.

## Setup

1. **Install dependencies**:
   ```bash
   cd mock-api
   npm install
   ```

2. **Start the mock API server**:
   ```bash
   npm start
   ```

The mock API will run on **http://localhost:3001**

## Available Endpoints

json-server automatically creates RESTful endpoints based on `db.json`:

### GET /tasks
Retrieve all tasks
```bash
curl http://localhost:3001/tasks
```

### GET /tasks/:id
Retrieve a single task by ID
```bash
curl http://localhost:3001/tasks/1
```

### POST /tasks
Create a new task
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "createdAt": "2026-02-18T12:00:00.000Z"
  }'
```

**Note:** The exact fields required will be explained by the invigilator. The above is just an example.

### PUT /tasks/:id
Update entire task (replace)
```bash
curl -X PUT http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "title": "Updated Task",
    "description": "Updated description",
    "status": "in-progress",
    "createdAt": "2026-02-18T10:00:00.000Z"
  }'
```

### PATCH /tasks/:id
Update partial task fields
```bash
curl -X PATCH http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### DELETE /tasks/:id
Delete a task
```bash
curl -X DELETE http://localhost:3001/tasks/1
```

## Additional Features

json-server provides filtering, sorting, and pagination:

### Filter tasks
```bash
# Get tasks with status "todo"
http://localhost:3001/tasks?status=todo

# Get tasks with status "in-progress"
http://localhost:3001/tasks?status=in-progress
```

### Sort tasks
```bash
# Sort by createdAt in descending order
http://localhost:3001/tasks?_sort=createdAt&_order=desc
```

### Pagination
```bash
# Get page 1 with 10 items per page
http://localhost:3001/tasks?_page=1&_limit=10
```

## Data Persistence

Changes made through the API are **automatically saved** to `db.json`. The file updates in real-time as you create, update, or delete tasks.

## Important Notes

- **IDs are auto-generated** when you POST without an id
- Data persists between server restarts (saved to db.json)
- The server has **CORS enabled** by default
- It returns proper HTTP status codes (200, 201, 404, etc.)
- The initial `db.json` only contains minimal structure - you must design the complete task schema based on requirements

## For Your Implementation

When building your Angular frontend:

1. Set your API base URL to `http://localhost:3001`
2. Use Angular's `HttpClient` to make requests
3. Create a service to handle all API calls
4. Implement proper error handling
5. Handle loading states

Good luck! 🚀
