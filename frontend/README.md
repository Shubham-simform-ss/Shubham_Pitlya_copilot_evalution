# Frontend Setup

This folder contains a minimal Angular application for the AI-Assisted Developer Evaluation Test.

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Angular CLI (install globally: `npm install -g @angular/cli`)

## Installation

```bash
cd frontend
npm install
```

## Running the Frontend

### Development Server

```bash
npm start
```

The Angular app will run on **http://localhost:4200**

Navigate to [http://localhost:4200](http://localhost:4200) in your browser. The application will automatically reload if you change any source files.

## For Frontend-Only Candidates

### Important: Use the Mock API

If you're working on frontend only, you **must** use the provided mock API:

1. **Start the Mock API first** (in a separate terminal):
   ```bash
   cd mock-api
   npm install
   npm start
   ```
   Mock API runs on **http://localhost:3001**

2. **Then start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm start
   ```

3. **Configure your service** to use the Mock API base URL: `http://localhost:3001`

📘 **See [../mock-api/README.md](../mock-api/README.md) for full API documentation**

### Verify Mock API

Visit [http://localhost:3001/tasks](http://localhost:3001/tasks) to see the initial task structure.

## For Full-Stack Candidates

If you're implementing both backend and frontend:

1. **Start your backend** (in one terminal):
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on **http://localhost:3000**

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm start
   ```

3. **Configure your service** to use your backend API: `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.module.ts           # Main module
│   │   ├── app-routing.module.ts   # Routing configuration
│   │   ├── app.component.ts        # Root component
│   │   ├── app.component.html      # Root template
│   │   └── components/             # Feature components
│   │       ├── home/               # Home component
│   │       └── health/             # Health component
│   ├── index.html                  # Main HTML
│   ├── main.ts                     # Application entry point
│   └── styles.css                  # Global styles
├── angular.json                    # Angular configuration
├── package.json
└── tsconfig.json                   # TypeScript configuration
```

## What's Already Set Up

✅ Angular application bootstrap  
✅ Basic routing (Home and Health routes)  
✅ HttpClientModule imported (ready for API calls)  
✅ Component structure  
✅ Minimal global styles  

## For Your Implementation

You need to:
- Create a task management component
- Build forms for creating/editing tasks
- Create a service to handle API calls
- Implement proper error handling
- Add loading states for async operations
- Display tasks in a user-friendly way

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the project for production
- `npm test` - Execute unit tests (if implemented)

## Tips

- Use Angular's **Reactive Forms** for form handling
- Create a **service** to encapsulate all HTTP calls
- Use **TypeScript interfaces** for type safety
- Handle **loading and error states** in your components
- Keep components **focused and reusable**

Good luck! 🚀
