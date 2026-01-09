# 📊 Employee Management System

> A modern, full-featured project management platform built with Next.js, TypeScript, and PostgreSQL

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

---


## 🎯 Overview

A comprehensive enterprise-grade employee and project management system designed for modern teams. Built with cutting-edge web technologies, offering real-time collaboration, task tracking, attendance management, and powerful analytics.

**Perfect for**: Development teams, agencies, consulting firms, and enterprises managing multiple projects.

---

## ✨ Key Features

### 🔐 User Management
- Role-based access control (Admin, Manager, Member)
- Secure authentication with session management
- User profiles and team management

### 📋 Project & Task Management
- Hierarchical task structure with subtasks
- Kanban board and list views
- Custom fields and task dependencies
- Epic and milestone tracking
- Priority and status management

### ⏰ Attendance Tracking
- Clock in/out functionality
- Automatic shift end at 11:59 PM
- Attendance reports and analytics
- Workspace-specific tracking

### 🔔 Real-time Notifications
- Instant task assignment alerts
- Comment and mention notifications
- Mark as read/unread
- Optimistic UI updates

### 📊 Analytics & Reporting
- Sprint burndown charts
- Velocity tracking
- Completion rate metrics
- Time tracking reports
- Custom report generation

### 🐛 Bug Tracking
- Bug reporting with file attachments
- Status tracking and prioritization
- Comment system
- Resolution tracking

### 👥 Client Portal
- Client invitation system
- Limited project visibility
- Progress tracking for stakeholders

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 16.1.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI Components

**Backend**
- Next.js API Routes
- Hono.js
- Drizzle ORM
- PostgreSQL

**Deployment**
- Vercel
- Neon/Supabase (Database)

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+ and npm
PostgreSQL database
```

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd Management-system
   npm install
   ```

2. **Configure environment**
   
   Create `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Setup database**
   ```bash
   npx drizzle-kit push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---


## 📁 Project Structure

```
Management-system/
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature modules
│   ├── db/               # Database config & schema
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── drizzle/              # Database migrations
├── public/               # Static assets
└── [config files]
```

---

## 📝 API Documentation

### Authentication
```
POST   /api/auth/login      - Sign in
POST   /api/auth/register   - Sign up
POST   /api/auth/logout     - Sign out
GET    /api/auth/current    - Get current user
```

### Notifications
```
GET    /api/notifications                 - List notifications
PATCH  /api/notifications/[id]/read       - Mark as read
PATCH  /api/notifications/mark-all-read   - Mark all read
DELETE /api/notifications/[id]            - Delete notification
DELETE /api/notifications/clear-all       - Clear all
```

### Tasks, Projects, Workspaces
Feature modules expose full CRUD operations via REST API.

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

### Environment Variables

```env
DATABASE_URL              # Required
NEXT_PUBLIC_APP_URL       # Required
EMAIL_HOST                # Optional
EMAIL_PORT                # Optional
EMAIL_USER                # Optional
EMAIL_PASS                # Optional
```

---

## 📜 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Run ESLint
npm run db:push  # Push schema changes
npm run db:studio # Open Drizzle Studio
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🐛 Troubleshooting

**Session Issues**
- Ensure database has `sessions` table
- Cookie name: `jcn-jira-clone-session`
- Clear browser cookies and sign in fresh

**Notifications**
- Uses Next.js API routes for mutations
- 60-second background polling
- Optimistic updates enabled

**Mobile View**
- Uses `min-h-dvh` for proper height
- Theme transitions disabled
- Hydration warnings suppressed

---

## 📞 Support

For questions or issues, please open an issue in the repository.

---

<div align="center">

**Built with ❤️ using Next.js and modern web technologies**

Made by GGS Information Services

</div>

