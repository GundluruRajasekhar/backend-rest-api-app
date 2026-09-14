# Users, Projects & Tasks API

A REST API that manages users, projects, and tasks — the backend powering the
**DevPulse** dashboard and the downstream platform. Built with **Node.js,
Express, and MongoDB (Mongoose)**.

## Features

- User management (create, list, get, update, delete)
- Project creation and retrieval, scoped to an owner
- Task creation, update, and deletion, scoped to a project
- Dedicated task status management endpoint (`todo` / `in-progress` / `done`)
- Centralized error handling with consistent JSON error responses
- Input validation on every write operation (`express-validator`)
- Meaningful HTTP status codes (200/201/204/400/404/409/500)
- Configuration and secrets via environment variables
- Pagination and filtering on list endpoints
- Security headers (`helmet`) and CORS enabled

## Tech Stack

| Layer          | Choice                     |
|----------------|----------------------------|
| Runtime        | Node.js                    |
| Framework      | Express 4                  |
| Database       | MongoDB + Mongoose         |
| Validation     | express-validator          |
| Auth-ready     | bcryptjs (password hashing)|

## Project Structure

```
src/
  config/db.js            MongoDB connection
  models/                 Mongoose schemas: User, Project, Task
  controllers/             Route handler logic
  routes/                  Express routers + validation chains
  middleware/               validate.js, errorHandler.js, notFound.js
  utils/                   ApiError.js, asyncHandler.js
  app.js                   Express app (middleware + routes)
  server.js                Entry point — connects DB, starts server
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your MongoDB connection string:

```bash
cp .env.example .env
```

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/users-projects-tasks
```

### 3. Run the server

```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start        # plain node
```

The API is now available at `http://localhost:5000`. Health check:
`GET /api/health`.

## API Reference

All responses follow one of two shapes:

**Success**
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 20, "total": 5, "pages": 1 } }
```
`meta` only appears on paginated list endpoints.

**Error**
```json
{ "success": false, "error": { "message": "Task not found", "details": [ ] } }
```
`details` only appears for validation errors, and lists each failing field.

### Users

| Method | Endpoint          | Description                    | Success Status |
|--------|-------------------|---------------------------------|-----------------|
| POST   | `/api/users`      | Create a user                   | 201             |
| GET    | `/api/users`      | List users (paginated)          | 200             |
| GET    | `/api/users/:id`  | Get a single user               | 200             |
| PATCH  | `/api/users/:id`  | Update `name` / `role`          | 200             |
| DELETE | `/api/users/:id`  | Delete a user                   | 204             |

**Create user — body**
```json
{ "name": "Rajasekhar", "email": "raja@example.com", "password": "at-least-8-chars", "role": "member" }
```

### Projects

| Method | Endpoint             | Description                        | Success Status |
|--------|----------------------|-------------------------------------|-----------------|
| POST   | `/api/projects`      | Create a project                    | 201             |
| GET    | `/api/projects`      | List projects (filter/paginate)     | 200             |
| GET    | `/api/projects/:id`  | Get a single project                | 200             |
| PATCH  | `/api/projects/:id`  | Update `name`/`description`/`status`| 200             |
| DELETE | `/api/projects/:id`  | Delete a project (cascades tasks)   | 204             |

Query params on `GET /api/projects`: `owner`, `status` (`active`\|`archived`), `page`, `limit`.

**Create project — body**
```json
{ "name": "DevPulse", "description": "Developer productivity dashboard", "owner": "<userId>", "status": "active" }
```

### Tasks

| Method | Endpoint                 | Description                              | Success Status |
|--------|--------------------------|--------------------------------------------|-----------------|
| POST   | `/api/tasks`             | Create a task                              | 201             |
| GET    | `/api/tasks`              | List tasks (filter/paginate)               | 200             |
| GET    | `/api/tasks/:id`          | Get a single task                          | 200             |
| PATCH  | `/api/tasks/:id`          | Update `title`/`description`/`assignee`/`dueDate` | 200      |
| PATCH  | `/api/tasks/:id/status`   | Update only the task's status              | 200             |
| DELETE | `/api/tasks/:id`          | Delete a task                              | 204             |

Query params on `GET /api/tasks`: `project`, `assignee`, `status`, `page`, `limit`.

**Create task — body**
```json
{ "title": "Build metrics API", "project": "<projectId>", "assignee": "<userId>", "status": "todo", "dueDate": "2026-09-20" }
```

**Update status — body**
```json
{ "status": "in-progress" }
```
Allowed values: `todo`, `in-progress`, `done`.

## Error Handling & Status Codes

| Status | Meaning                                            |
|--------|-----------------------------------------------------|
| 200    | Request succeeded                                   |
| 201    | Resource created                                     |
| 204    | Resource deleted (no body returned)                  |
| 400    | Validation failed / bad input / invalid reference id |
| 404    | Resource not found                                    |
| 409    | Conflict (e.g. duplicate email)                        |
| 500    | Unexpected server error                                |

All errors — validation failures, invalid MongoDB ObjectIds, duplicate-key
errors, and unhandled exceptions — pass through a single `errorHandler`
middleware (`src/middleware/errorHandler.js`) and are normalized into the
same JSON error shape.

## API Collection

A ready-to-import Postman collection is included at
[`postman_collection.json`](./postman_collection.json), covering every
endpoint above with example request bodies. Import it into Postman and set
a collection variable `baseUrl` (default `http://localhost:5000/api`).

## Notes

- Passwords are hashed with bcrypt before storage and are never returned in
  API responses.
- Deleting a project cascades and removes its tasks, keeping the data
  consistent for downstream consumers (the DevPulse dashboard, Task 4's platform).
- All list endpoints are paginated (`page`, `limit`, default 20, max 100) to
  keep responses predictable at scale.
