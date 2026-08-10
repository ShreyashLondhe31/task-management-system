# Task Management System

![Dashboard Preview](./frontend/public/pyramid-preview.png)

## Overview
Task Management System is a premium, full-stack application designed with modern UI/UX principles. It features a beautiful, responsive dashboard with drag-and-drop columns, list views, priority filtering, and seamless guest/Google authentication. 

This repository was created as an internship assignment for AbleSpace, satisfying all technical requirements and featuring a custom-built, highly polished interface.

## Live Demo
**Frontend:** [https://task-management-frontend-eight-beta.vercel.app](https://task-management-frontend-eight-beta.vercel.app)
*(The backend is hosted on Render and may take 50 seconds to spin up on the first request if it is asleep).*

## Tech Stack
### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** Sonner
- **API Client:** Axios
- **Deployment:** Vercel

### Backend
- **Framework:** NestJS
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT & Google OAuth2
- **Deployment:** Render (with GitHub Actions keep-alive workflow)

## Features
- 🚀 **Full-Stack Architecture:** Next.js frontend communicating with a robust NestJS backend.
- 🔐 **Authentication:** Secure Guest Login and Google OAuth integration.
- 📋 **Dynamic Views:** Switch instantly between Board View (Kanban) and List View.
- 🏷️ **Custom Columns:** To Do, Doing, Completed, and On Hold.
- 🔍 **Real-Time Filtering:** Search tasks by title/description and filter by Priority (High, Medium, Low).
- 🎨 **Premium UI/UX:** Clean, modern interface with micro-interactions, smooth transitions, and a beautiful Toaster system for alerts.
- 📱 **Fully Responsive:** Works perfectly on desktop, tablet, and mobile.

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (local or cloud)

### Environment Variables
You will need to set up `.env` files in both the `frontend` and `backend` directories.
See the respective directories for configuration details.

### Running the Backend
```bash
cd backend
npm install
npx prisma db push
npm run start:dev
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

## Part 2 Submission
The Part 2 Product Understanding submission (AbleSpace Take Data screen workflow analysis and UI/UX improvements) is included in this repository as `AbleSpace_Review.pdf`.

## License
MIT License
