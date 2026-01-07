# Project Structure

## Production-Ready Folder Organization

```
Management-system/
├── .next/                      # Next.js build output
├── .vscode/                    # VS Code workspace settings
├── docs/                       # Documentation
│   ├── AUTO_END_SHIFT_AND_PERFORMANCE.md
│   ├── CLIENT_ACCESS_FEATURE.md
│   ├── COMPREHENSIVE_SYSTEM_GUIDE.md
│   ├── CUSTOM_FIELDS_GUIDE.md
│   ├── DATABASE_STRUCTURE.md
│   ├── HIERARCHICAL_TASK_WORKFLOW_ANALYSIS.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── PROJECT_SPECIFIC_COLUMNS.md
│   ├── PROJECT_SPECIFIC_TASK_FORMS.md
│   ├── QUICK_START_CUSTOM_FIELDS.md
│   ├── ROLE_BASED_ACCESS_CONTROL.md
│   └── USER_ROLES_ACCESS_GUIDE.md
├── drizzle/                    # Database migrations
│   └── *.sql                   # Migration files
├── node_modules/               # Dependencies
├── public/                     # Static assets
│   ├── logo.svg
│   └── ...
├── scripts/                    # Utility scripts
│   └── ...
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (sign-in, sign-up)
│   │   ├── (standalone)/      # Standalone pages
│   │   ├── admin/             # Admin panel
│   │   ├── api/               # API routes
│   │   ├── attendance/        # Attendance pages
│   │   ├── board/             # Kanban board
│   │   ├── bugs/              # Bug tracker
│   │   ├── client/            # Client access
│   │   ├── dashboard/         # Main dashboard
│   │   ├── invite/            # Invitation pages
│   │   ├── report/            # Report pages
│   │   ├── reports/           # Additional reports
│   │   ├── summary/           # Summary pages
│   │   ├── tasks/             # Task management
│   │   ├── weekly-report/     # Weekly reports
│   │   └── workspaces/        # Workspace management
│   ├── components/            # Shared React components
│   │   ├── analytics.tsx
│   │   ├── analytics-card.tsx
│   │   ├── data-calendar.tsx
│   │   ├── data-filters.tsx
│   │   ├── date-picker.tsx
│   │   ├── dotted-separator.tsx
│   │   ├── mobile-sidebar.tsx
│   │   ├── navbar.tsx
│   │   ├── navigation.tsx
│   │   ├── page-error.tsx
│   │   ├── page-loader.tsx
│   │   ├── projects.tsx
│   │   ├── responsive-modal.tsx
│   │   ├── sidebar.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── db/                    # Database
│   │   ├── index.ts          # Drizzle client
│   │   └── schema.ts         # Database schema (31 tables)
│   ├── features/             # Feature modules
│   │   ├── attendance/       # Attendance feature
│   │   ├── auth/            # Authentication
│   │   ├── bugs/            # Bug tracking
│   │   ├── client-invites/  # Client invitations
│   │   ├── members/         # Member management
│   │   ├── notifications/   # Notifications
│   │   ├── projects/        # Projects
│   │   ├── requirements/    # Requirements
│   │   ├── tasks/           # Tasks
│   │   ├── users/           # User management
│   │   ├── weekly-reports/  # Weekly reports
│   │   └── workspaces/      # Workspaces
│   ├── hooks/               # Custom React hooks
│   │   ├── use-confirm.tsx
│   │   ├── use-mobile.tsx
│   │   ├── use-panel.tsx
│   │   └── use-task-filters.ts
│   ├── lib/                 # Utility libraries
│   │   ├── cookie-config.ts
│   │   ├── rpc.ts
│   │   ├── session-middleware.ts
│   │   └── utils.ts
│   └── middleware.ts        # Next.js middleware
├── .env.example             # Environment variables template
├── .env.local               # Local environment variables (gitignored)
├── .env.production.example  # Production env template
├── .gitignore              # Git ignore rules
├── .npmrc                  # npm configuration
├── AUTH_SESSION_FIX.md     # Auth fix documentation
├── components.json         # shadcn/ui config
├── DATABASE_SCHEMA.md      # Complete DB schema (NEW)
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
├── dotenv-config.js        # Dotenv configuration
├── drizzle.config.ts       # Drizzle ORM config
├── init-db.js              # Database initialization
├── init-schema.sql         # Initial SQL schema
├── next.config.mjs         # Next.js configuration
├── next-env.d.ts           # Next.js TypeScript definitions
├── package.json            # Dependencies and scripts
├── package-lock.json       # Dependency lock file
├── postcss.config.mjs      # PostCSS configuration
├── PROJECT_STRUCTURE.md    # This file
├── README.md               # Project overview
├── start-dev.ps1           # Development startup script
├── tailwind.config.ts      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── tsconfig.tsbuildinfo    # TypeScript build info
├── VERCEL_ENV_SETUP.md     # Vercel deployment guide
└── vercel.json             # Vercel configuration
```

## Key Directories

### `/src/app` - Next.js App Router
All pages and API routes using Next.js 14 App Router architecture.

### `/src/features` - Feature Modules
Each feature is self-contained with:
- `api/` - React Query hooks
- `components/` - Feature-specific UI components
- `hooks/` - Feature-specific hooks
- `schemas.ts` - Zod validation schemas
- `server/` - Server actions and API routes
- `types.ts` - TypeScript types
- `queries.ts` - Database queries
- `utils.ts` - Feature utilities

### `/src/db` - Database Layer
- `schema.ts` - Drizzle ORM schema (31 tables)
- `index.ts` - Database client configuration

### `/src/components` - Shared Components
Reusable React components used across multiple features.

### `/drizzle` - Database Migrations
Auto-generated migration files from Drizzle Kit.

### `/docs` - Documentation
Comprehensive guides for features, APIs, and workflows.

### `/public` - Static Assets
Images, logos, and other static files served directly.

### `/scripts` - Utility Scripts
Helper scripts for development and maintenance.

## File Naming Conventions

- **Components:** `kebab-case.tsx` (e.g., `create-task-form.tsx`)
- **Hooks:** `use-*.ts` (e.g., `use-create-task.ts`)
- **API Routes:** `route.ts` in `app/api/[feature]/`
- **Server Actions:** `route.ts` in `features/[feature]/server/`
- **Types:** `types.ts` in feature folders
- **Schemas:** `schemas.ts` with Zod validation

## Database Migrations

```bash
# Generate migration from schema changes
npm run db:generate

# Push schema to database (development)
npm run db:push

# Apply migrations (production)
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Environment Files

- `.env.local` - Local development (gitignored)
- `.env.production.example` - Production template
- `.env.example` - All environment variables documented

## Build Output

- `.next/` - Next.js build artifacts
- `tsconfig.tsbuildinfo` - TypeScript incremental build cache

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.mjs` | Next.js configuration |
| `drizzle.config.ts` | Database ORM configuration |
| `tailwind.config.ts` | Tailwind CSS styling |
| `tsconfig.json` | TypeScript compiler options |
| `components.json` | shadcn/ui component config |
| `vercel.json` | Vercel deployment settings |
| `postcss.config.mjs` | PostCSS transformations |

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to DB
npm run db:studio    # Open Drizzle Studio
```

## Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Clean Architecture Benefits

✅ **Feature-based organization** - Easy to locate and maintain code  
✅ **Clear separation of concerns** - API, components, types in distinct folders  
✅ **Type-safe database** - Drizzle ORM with TypeScript  
✅ **Scalable structure** - Add new features without affecting existing code  
✅ **Self-documenting** - Clear folder names and conventions  
✅ **Testing-friendly** - Isolated features are easier to test  

---

**Last Updated:** 2026-01-07  
**Version:** 1.0.0 (Production-Ready)
