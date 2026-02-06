# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Instructions

Remember to push to github for each task you complete and finish.

## Commands

```bash
npm run dev       # Start dev server (Next.js)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint (next lint + prettier)
```

No test framework is configured. There are no test commands.

## Architecture

**Stack:** Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / shadcn/ui (New York style) / Supabase / React 19

### Route Groups

- `src/app/(auth)/` — Public auth pages (login, signup, forgot-password). Simple layout, no sidebar.
- `src/app/(dashboard)/` — Protected pages wrapped in `AppLayout` (sidebar + topbar). Middleware redirects unauthenticated users to `/login`.
- `src/app/auth/callback/route.ts` — OAuth callback handler (server route).
- `src/app/page.tsx` — Root redirects to `/dashboard`.

### Supabase Clients

Two client factories, use the right one based on context:
- **Server** (`src/lib/supabase/server.ts`): `createClient()` — async, uses `cookies()` from `next/headers`. For Server Components, Route Handlers, Server Actions.
- **Client** (`src/lib/supabase/client.ts`): `createClient()` — sync, uses `createBrowserClient`. For Client Components.
- **Middleware** (`src/lib/supabase/middleware.ts`): `updateSession()` — refreshes auth session on every request.

### Data Layer

- `src/lib/queries/` — Read functions. Each takes a Supabase client as the first parameter and returns typed data.
- `src/lib/mutations/` — Write functions (create/update/delete). Same client-first pattern.
- `src/lib/validations/` — Zod schemas for form validation (used with react-hook-form's `zodResolver`).
- `src/types/database.ts` — TypeScript types for all database tables and enums.

### Component Organization

- `src/components/ui/` — shadcn/ui primitives (Button, Card, Dialog, etc.). Use CVA for variants, Radix UI for accessibility. Add new ones via `npx shadcn@latest add <component>`.
- `src/components/layout/` — AppLayout (sidebar + topbar wrapper), Sidebar, TopBar, Breadcrumbs.
- `src/components/modals/` — CRUD modals (create-project, create-task, schedule-meeting, invite-member). All use react-hook-form + zod.
- `src/components/projects/` — Project detail tab views (KanbanBoard, TaskList, TimelineView, DocumentsView, etc.).

### Layout Structure

```
AppLayout
├── Sidebar (240px, collapsible on mobile)
│   └── Nav items with active state + real-time badge counts
└── Main Area
    ├── TopBar (search, notifications bell, user avatar)
    └── {children} (page content)
```

### Key Utilities

- `cn()` from `src/lib/utils.ts` — merges Tailwind classes (clsx + tailwind-merge). Use this for all conditional className logic.
- `src/lib/formatters.ts` — `formatDate()`, `formatRelativeDate()`, `formatTime()`, `bytesToSize()`, `getInitials()`, `getErrorMessage()`.

### Database

Schema lives in `supabase/migrations/`. Key tables: `profiles`, `projects`, `project_members`, `tasks`, `tags`, `task_tags`, `meetings`, `meeting_attendees`, `documents`, `comments`, `messages`, `notifications`, `notification_preferences`. All have RLS policies defined.

Storage buckets: `documents`, `avatars` (defined in `00002_storage.sql`).

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json). Always use `@/` imports.

### Styling

- Tailwind CSS v4 with CSS custom properties for theming (OKLCH color space).
- Dark mode via `next-themes` and the `.dark` class variant.
- Theme variables defined in `src/app/globals.css`.

### Design File

The `.pen` design file is at `/Users/omniingredients/Downloads/project-management-app.pen` (not in the repo). Access it only via Pencil MCP tools.
