import dotenv from 'dotenv';
import app from './app';
import { config } from './config/env';

// Load environment variables
dotenv.config();

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('\n🚀 Server is running!\n');
  console.log(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/api/tasks`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` CORS Origin: ${config.corsOrigin}\n`);
  console.log('Available Endpoints:');
  console.log('  GET    /api/tasks        - Get all tasks (with pagination)');
  console.log('  GET    /api/tasks/:id    - Get task by ID');
  console.log('  POST   /api/tasks        - Create new task');
  console.log('  PUT    /api/tasks/:id    - Update task (full)');
  console.log('  PATCH  /api/tasks/:id    - Update task (partial)');
  console.log('  DELETE /api/tasks/:id    - Delete task');
  console.log('  DELETE /api/tasks        - Delete all tasks\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
