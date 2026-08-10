# AbleSpace - Full-Stack Task Management System

AbleSpace Task Management System is a premium, full-stack application delivered as a modern three-tier web application:

1. **Presentation tier:** React (Next.js 14) and Tailwind CSS, deployed on Vercel.
2. **Application tier:** Node.js and NestJS REST API, deployed on Render.
3. **Data tier:** PostgreSQL (Neon) for highly scalable serverless data storage.

The repository also demonstrates robust CI/CD pipelines, container-ready backend deployment, and modern authentication strategies.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat-square&logo=render)

## Features

- Dynamic Kanban Board and List Views for task management.
- Custom columns: To Do, Doing, Completed, and On Hold.
- Real-time priority filtering and search.
- Guest login and Google OAuth2 authentication.
- Premium UI/UX with micro-interactions and custom toast notifications (Sonner).

## Live Demo

**Frontend:** [https://task-management-frontend-eight-beta.vercel.app](https://task-management-frontend-eight-beta.vercel.app)
*(The backend is hosted on Render's free tier. A background Keep-Alive GitHub Action is running, but if it happens to be asleep, the first request may take 50 seconds).*

## Architecture

```mermaid
flowchart LR
	U["Browser"] -->|HTTP/HTTPS| F["Presentation tier\nNext.js Application\nHosted on Vercel"]
	F -->|"/api/* proxy"| B["Application tier\nNestJS REST API\nHosted on Render"]
	B -->|"PostgreSQL Protocol"| D["Data tier\nServerless PostgreSQL\nHosted on Neon"]
	D --> V[("Persistent storage")]
```

### Request flow

1. A browser requests the Next.js frontend on Vercel.
2. The Next.js client sends API calls to the NestJS backend via `NEXT_PUBLIC_API_URL`.
3. NestJS routes the request, handles authentication and validation via Data Transfer Objects (DTOs), and queries the database using Prisma ORM.
4. Prisma securely executes queries against the Neon PostgreSQL database.

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration, defined in `.github/workflows/ci.yml`.

| Stage | What it does | 
|---|---|
| Trigger | Runs on `push` and `pull_request` to the `main` branch. |
| Backend Build | Installs dependencies, generates the Prisma client, and compiles the NestJS application. |
| Frontend Build | Installs dependencies and runs the Next.js production build (`next build`). |
| Deployment | Handled automatically by Vercel (Frontend) and Render (Backend) via webhook integrations. |

Additionally, a Keep-Alive workflow (`.github/workflows/keep-alive.yml`) runs a cron job every 14 minutes to ping the backend health endpoint, preventing the Render free tier instance from sleeping.

## Local development

Prerequisites: Node.js 18+ and PostgreSQL (local or cloud).

### 1. Database Setup
Create a PostgreSQL database and configure your connection string.

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file and add your DATABASE_URL
echo "DATABASE_URL=postgres://user:password@localhost:5432/db" > .env

# Sync the Prisma schema with your database
npx prisma db push

npm run start:dev
```
The NestJS backend will listen on `http://localhost:3001`.

### 3. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install

# Create a .env file and set the backend API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env

npm run dev
```
The Next.js development server will listen on `http://localhost:3000`.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check (used by Keep-Alive cron) |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login with credentials |
| POST | `/auth/guest-login` | Seamless guest authentication |
| GET | `/auth/google` | Trigger Google OAuth2 |
| GET | `/tasks` | Get all tasks for the authenticated user |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/:id` | Get a specific task |
| PATCH | `/tasks/:id` | Update a task (e.g. status, priority) |
| DELETE | `/tasks/:id` | Delete a task |

## Project structure

```text
.
├── frontend/                 # Next.js Presentation tier
├── backend/                  # NestJS Application tier & Prisma Schema
├── .github/workflows/        # CI/CD and Keep-Alive pipelines
├── AbleSpace_Review.pdf      # Part 2 Submission Analysis Document
└── README.md                 # Project documentation
```

## Security notes

- Strict CORS policies enforced by the backend to prevent cross-origin attacks.
- JWT tokens are utilized for stateless authentication.
- User passwords are cryptographically hashed using `bcryptjs` before entering the database.
- Database access is restricted to the application tier using Prisma connection strings.

## License and author

This project was developed as an internship assignment by **Shreyash Londhe**.
