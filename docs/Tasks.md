# ProjectHub - Task Breakdown

> **Cross-references:** [PRD.md](./PRD.md) | [Progress.md](./Progress.md) | [Success_Requirements.md](./Success_Requirements.md)

---

## Overview

**Total Tasks:** 24 (Task 0 through Task 18, including Tasks 13.5–13.9)
**Total Phases:** 7 (Phase 0, 1, 2, 3, 4, 4.5, 5, 6)
**Total Screens/Modals:** 22 (14 existing + 8 new)
**Git Commits:** 24 (one per task, each pushed to GitHub)

---

## PHASE 0: Design Fixes & Missing Screens

### Task 0: Fix Design Issues & Create Missing Screens in .pen File

| Field | Value |
|---|---|
| **Priority** | Critical |
| **Blocked by** | None |
| **Blocks** | None (parallel with Task 1) |
| **Branch** | `feat/task-0-design-fixes` |
| **Git Commit** | `feat: fix design issues and add missing screens to .pen file` |

**Scope:**
1. Fix Icon Button text clipping on base `hXOUF` component — set `poRwU` width to `fill_container`
2. Design Sign Up Page — mirror Login Page layout, add name + confirm password fields
3. Design Forgot Password Page — centered form with email input
4. Design My Tasks Page — table view of all tasks assigned to current user (cross-project), same layout as Project Detail Task List
5. Design Create/Edit Project Modal — using shadcn/ui Dialog: name, description, status, due date, team members
6. Design Create/Edit Task Modal — title, description, status, priority, assignee, due date, tags
7. Design Schedule Meeting Modal — title, date/time, duration, attendees, project, description
8. Design Invite Member Modal — email input, role select, send invite button
9. Design 404 Page — centered message with "Go to Dashboard" button
10. Run layout validation on all screens to confirm no remaining issues

**Affected Design Node IDs:** `hXOUF` (base component), `poRwU` (text node), `cErYf`, `d2GU6`, `ZXaYT`, `IUffR`, `JOZzw`, `6DlrG`, `AIb7y`, `RkBx6`, `FGP3H`, `Jlx8G`, `wqsc1`, `WSTsu` (top bars), `lUHh4` (modal close)

---

## PHASE 1: Foundation

### Task 1: Project Scaffolding & Configuration

| Field | Value |
|---|---|
| **Priority** | Critical |
| **Blocked by** | None |
| **Blocks** | Task 2, Task 3 |
| **Branch** | `feat/task-1-project-scaffolding` |
| **Git Commit** | `feat: initialize Next.js project with Tailwind, shadcn/ui, Supabase, and theme configuration` |

**Scope:**
1. Initialize Next.js 14+ project with App Router and TypeScript
2. Install and configure Tailwind CSS v4
3. Install and configure shadcn/ui (neutral base theme)
4. Set up Supabase client library
5. Configure CSS variables matching design system tokens (see [PRD.md §6](./PRD.md#6-design-system-details))
6. Set up Inter font via Google Fonts
7. Set up light/dark mode theming
8. Create folder structure: `/app`, `/components`, `/lib`, `/types`, `/hooks`
9. Set up ESLint + Prettier

---

### Task 2: Supabase Database Schema & Auth Setup

| Field | Value |
|---|---|
| **Priority** | Critical |
| **Blocked by** | Task 1 |
| **Blocks** | Task 4 |
| **Branch** | `feat/task-2-supabase-schema` |
| **Git Commit** | `feat: set up Supabase schema, auth, RLS policies, and seed data` |

**Scope:**
1. Create Supabase project (or connect to existing)
2. Define SQL migrations for all tables: `profiles`, `projects`, `tasks`, `meetings`, `meeting_attendees`, `documents`, `comments`, `tags`, `task_tags`, `project_members`
3. Set up Row-Level Security (RLS) policies
4. Configure Supabase Auth (email/password + Google OAuth)
5. Create auth helper utilities (`/lib/supabase/server.ts`, `/lib/supabase/client.ts`)
6. Seed database with mock data matching the design (4 projects, 6 team members, sample tasks/meetings)

**Schema Reference:** See [PRD.md §5](./PRD.md#5-database-schema-supabase)

---

### Task 3: Shared Layout Components (Sidebar + Top Bar)

| Field | Value |
|---|---|
| **Priority** | Critical |
| **Blocked by** | Task 1 |
| **Blocks** | Task 4, Task 17 |
| **Branch** | `feat/task-3-shared-layout` |
| **Git Commit** | `feat: build shared layout with sidebar, top bar, and breadcrumbs` |

**Scope:**
1. Build `Sidebar` component — logo ("ProjectHub"), section titles (Main, Team), nav items with Lucide icons
2. Active state highlighting on current route
3. Sidebar footer with user avatar, name, role
4. Build `TopBar` component — search input (left), notification bell + user avatar (right)
5. Build `AppLayout` wrapper combining Sidebar + TopBar + content area
6. Breadcrumb component for nested pages (e.g., Projects > Website Redesign)
7. Responsive: sidebar collapses on mobile

**Nav Items:** Dashboard (`layout-dashboard`), Projects (`folder-kanban`), My Tasks (`check-square`), Meetings (`calendar`), Team Members (`users`), Settings (`settings`)

---

## PHASE 2: Authentication

### Task 4: Login, Sign Up & Forgot Password Pages

| Field | Value |
|---|---|
| **Priority** | Critical |
| **Blocked by** | Task 2, Task 3 |
| **Blocks** | Task 5, Task 16 |
| **Branch** | `feat/task-4-auth-pages` |
| **Git Commit** | `feat: implement login, sign up, and forgot password pages with Supabase auth` |

**Scope:**
1. **Login Page** (`/login`): Split-panel layout — dark branding panel (left), form panel (right). Fields: Email, Password. "Remember me" checkbox, "Forgot password?" link. "Sign in" button. Google OAuth. "Don't have an account? Sign up" link.
2. **Sign Up Page** (`/signup`): Same split-panel. Fields: Full Name, Email, Password, Confirm Password. "Create account" button. Google OAuth. "Already have an account? Sign in" link.
3. **Forgot Password Page** (`/forgot-password`): Centered form, email input, "Send reset link" button, "Back to login" link.
4. Form validation with React Hook Form + Zod on all forms
5. Protected route middleware (redirect unauthenticated users to `/login`)
6. Redirect to `/dashboard` on successful login/signup

**Design Reference:** Login Page node `8rNQI`, Sign Up and Forgot Password from Task 0 designs

---

## PHASE 3: Dashboard

### Task 5: Dashboard Page

| Field | Value |
|---|---|
| **Priority** | High |
| **Blocked by** | Task 3, Task 4 |
| **Blocks** | Task 6, Task 14, Task 15, Task 16 |
| **Branch** | `feat/task-5-dashboard` |
| **Git Commit** | `feat: implement dashboard with stats, project progress, deadlines, and meetings` |

**Scope:**
1. Welcome banner: "Welcome back, {name}" with subtitle and "+ New Project" button
2. 4 stat cards in a row: Active Projects (12), Tasks Due Today (8), Upcoming Meetings (3), Team Members (24)
3. "Projects Progress" section: project list with progress bars and percentages
4. "Upcoming Deadlines" card: list with colored priority dots (red/yellow/green) and dates
5. "Upcoming Meetings" card: time-based list with meeting name, description, attendee avatars
6. All data fetched from Supabase

**Design Reference:** Dashboard node `3AR0o`

---

## PHASE 4: Projects

### Task 6: Projects List Page

| Field | Value |
|---|---|
| **Priority** | High |
| **Blocked by** | Task 5 |
| **Blocks** | Task 7, Task 13.6 |
| **Branch** | `feat/task-6-projects-list` |
| **Git Commit** | `feat: implement projects list page with table, filters, and create project` |

**Scope:**
1. Page header: "All Projects" with subtitle, Filter button, "+ New Project" button
2. Table: Project Name (with description), Status (badge), Progress (bar), Due Date, Team (avatar stack), Actions (gear)
3. Status badges color-coded: orange (In Progress), yellow (Review), green (Completed)
4. Row click navigates to Project Detail
5. Filter dropdown by status
6. "+ New Project" dialog/modal

**Design Reference:** Projects List node `SRj7b`

---

### Task 7: Project Detail - Task Board (Kanban)

| Field | Value |
|---|---|
| **Priority** | High |
| **Blocked by** | Task 6 |
| **Blocks** | Task 8, Task 9, Task 10, Task 11, Task 12, Task 13, Task 13.7 |
| **Branch** | `feat/task-7-kanban-board` |
| **Git Commit** | `feat: implement project detail kanban board with drag-and-drop` |

**Scope:**
1. Project header: name, status badge, due date, member count
2. Tab navigation: Task Board | Task List | Timeline | Documents | Meetings | Progress
3. Filter button + "+ Add Task" button
4. 4 Kanban columns: To Do, In Progress, Review, Done
5. Task cards: title, description snippet, due date, priority badge, assignee avatar, tag count
6. Drag-and-drop between columns (persists status to Supabase via @hello-pangea/dnd)
7. Column task count badges
8. Click card opens Task Detail Modal (Task 11)

**Design Reference:** Project Board node `dPnmJ`, Project Detail Task Board node `V2jnf`

---

### Task 8: Project Detail - Task List

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 7 |
| **Blocks** | Task 13.5 |
| **Branch** | `feat/task-8-task-list` |
| **Git Commit** | `feat: implement project detail task list view with sortable table` |

**Scope:**
1. Same project header and tabs as Task Board
2. Table: checkbox, Label/Task name, Status (badge), Priority (badge), Size (badge), Assignee (avatar + name), Due Date
3. Sortable columns
4. Row click opens Task Detail Modal
5. "+ Add Task" button
6. Shared data layer with Kanban view

**Design Reference:** Project Detail Task List node `8QJUo`

---

### Task 9: Project Detail - Timeline

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 7 |
| **Blocks** | None |
| **Branch** | `feat/task-9-timeline` |
| **Git Commit** | `feat: implement project detail timeline/gantt view` |

**Scope:**
1. Gantt-style timeline with weekly columns (Mon–Sun)
2. Task bars color-coded by status/category
3. "Week View" toggle button
4. Task names on left, horizontal bars spanning date ranges
5. Navigation arrows for week switching

**Design Reference:** Project Detail Timeline node `ZAITU`

---

### Task 10: Project Detail - Documents

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 7 |
| **Blocks** | None |
| **Branch** | `feat/task-10-documents` |
| **Git Commit** | `feat: implement project detail documents view with file upload` |

**Scope:**
1. "Project Documents" heading with search bar
2. "+ Upload File" button (uploads to Supabase Storage)
3. Document grid cards: file icon, filename, file size, upload date, category badge
4. File type detection for icon display (PDF/PNG/XLSX/JSON)
5. Search/filter documents
6. File download on click

**Design Reference:** Project Detail Documents node `ZKFMd`

---

### Task 11: Task Detail Modal

| Field | Value |
|---|---|
| **Priority** | High |
| **Blocked by** | Task 7 |
| **Blocks** | None |
| **Branch** | `feat/task-11-task-detail-modal` |
| **Git Commit** | `feat: implement task detail modal with comments and metadata` |

**Scope:**
1. Modal overlay with close button (X)
2. Header: task title, status badge, priority badge
3. Left panel: Description text, Comments section (avatar + name + timestamp + message)
4. Right sidebar (muted background): Assignee, Due Date, Project name, Tags (badges)
5. Add comment functionality
6. Edit task fields inline

**Design Reference:** Task Detail Modal node `M20lk`

---

### Task 12: Project Detail - Meetings

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 7 |
| **Blocks** | Task 13.8 |
| **Branch** | `feat/task-12-project-meetings` |
| **Git Commit** | `feat: implement project detail meetings view` |

**Scope:**
1. "Project Meetings" heading + "+ Schedule Meeting" button
2. Meeting list items: time, duration badge, name, description, attendee avatars, date
3. Dividers between entries
4. Meetings sorted by date/time

**Design Reference:** Project Detail Meetings node `SDB6k`

---

### Task 13: Project Detail - Progress

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 7 |
| **Blocks** | None |
| **Branch** | `feat/task-13-project-progress` |
| **Git Commit** | `feat: implement project detail progress view with charts and activity feed` |

**Scope:**
1. "Overall Progress" with large progress bar and percentage
2. Summary stats: Total Tasks, Completed, In Progress, To Do
3. "Task Progress by Status" horizontal bar chart (Recharts)
4. "Recent Activity" feed: avatar + action description + timestamp
5. All stats derived from live Supabase task data

**Design Reference:** Project Detail Progress node `6SmPk`

---

## PHASE 4.5: My Tasks & CRUD Modals

### Task 13.5: My Tasks Page

| Field | Value |
|---|---|
| **Priority** | High |
| **Blocked by** | Task 8 |
| **Blocks** | None |
| **Branch** | `feat/task-13.5-my-tasks` |
| **Git Commit** | `feat: implement my tasks page with cross-project task list` |

**Scope:**
1. Page at `/tasks` matching sidebar "My Tasks" nav item
2. Same AppLayout (sidebar + top bar)
3. Table of all tasks assigned to current user across ALL projects
4. Columns: checkbox, Task name, Project name, Status (badge), Priority (badge), Due Date
5. Filter by status, priority, project
6. Sortable columns
7. Row click opens Task Detail Modal
8. Empty state when user has no tasks

**Design Reference:** My Tasks design from Task 0

---

### Task 13.6: Create/Edit Project Modal

| Field | Value |
|---|---|
| **Priority** | High |
| **Blocked by** | Task 6 |
| **Blocks** | None |
| **Branch** | `feat/task-13.6-project-modal` |
| **Git Commit** | `feat: implement create/edit project modal` |

**Scope:**
1. Modal triggered by "+ New Project" button (Dashboard, Projects List)
2. Form fields: Project Name, Description, Status (select), Due Date (date picker), Team Members (multi-select)
3. Edit mode: pre-fill fields for existing project
4. Save creates/updates project in Supabase
5. Uses shadcn/ui Dialog, Input, Select, DatePicker

**Design Reference:** Create/Edit Project Modal design from Task 0

---

### Task 13.7: Create/Edit Task Modal

| Field | Value |
|---|---|
| **Priority** | High |
| **Blocked by** | Task 7 |
| **Blocks** | None |
| **Branch** | `feat/task-13.7-task-modal` |
| **Git Commit** | `feat: implement create/edit task modal` |

**Scope:**
1. Modal triggered by "+ Add Task" button (Kanban, Task List)
2. Form fields: Title, Description (textarea), Status (select), Priority (select), Assignee (select), Due Date (date picker), Tags (multi-select/input)
3. Edit mode: pre-fill fields for existing task
4. Save creates/updates task in Supabase with correct project reference

**Design Reference:** Create/Edit Task Modal design from Task 0

---

### Task 13.8: Schedule Meeting Modal

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 12 |
| **Blocks** | None |
| **Branch** | `feat/task-13.8-meeting-modal` |
| **Git Commit** | `feat: implement schedule meeting modal` |

**Scope:**
1. Modal triggered by "+ Schedule Meeting" button (Meetings page, Project Meetings)
2. Form fields: Meeting Title, Date (date picker), Time (time picker), Duration (select), Project (select, optional), Attendees (multi-select), Description (textarea)
3. Save creates meeting in Supabase with attendees and project reference

**Design Reference:** Schedule Meeting Modal design from Task 0

---

### Task 13.9: Invite Member Modal

| Field | Value |
|---|---|
| **Priority** | Low |
| **Blocked by** | Task 15 |
| **Blocks** | None |
| **Branch** | `feat/task-13.9-invite-modal` |
| **Git Commit** | `feat: implement invite member modal` |

**Scope:**
1. Modal triggered by "+ Invite Member" button on Team Members page
2. Form fields: Email address, Role (select: Project Manager, Designer, Developer, QA Engineer, etc.)
3. Send invite via Supabase Auth invite or email
4. Success confirmation shown to user

**Design Reference:** Invite Member Modal design from Task 0

---

## PHASE 5: Meetings & Team

### Task 14: Meetings Page (Global)

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 5 |
| **Blocks** | None |
| **Branch** | `feat/task-14-meetings-page` |
| **Git Commit** | `feat: implement global meetings page with calendar and meeting list` |

**Scope:**
1. Page header: "Meetings" with subtitle + "+ Schedule Meeting" button
2. Left panel: Calendar (month view), navigation arrows, "Today" button
3. Right panel: "Today's Meetings" list with time, name, description, attendee avatars
4. Clicking a date filters meetings for that day

**Design Reference:** Meetings Page node `6Svw1`

---

### Task 15: Team Members Page

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Task 5 |
| **Blocks** | Task 13.9 |
| **Branch** | `feat/task-15-team-members` |
| **Git Commit** | `feat: implement team members page with member cards and invite flow` |

**Scope:**
1. Page header: "Team Members" with subtitle + "+ Invite Member" button
2. Card grid (3 cols): avatar (colored circle with initials), name, role, department badge, email, phone
3. "Message" and "Profile" action buttons per card
4. Responsive: 3 cols → 2 → 1

**Design Reference:** Team Members node `5u3Cr`

---

## PHASE 6: Settings & Polish

### Task 16: Settings Page

| Field | Value |
|---|---|
| **Priority** | Low |
| **Blocked by** | Task 5, Task 4 |
| **Blocks** | None |
| **Branch** | `feat/task-16-settings` |
| **Git Commit** | `feat: implement settings page with profile and notification preferences` |

**Scope:**
1. Settings tabs (left sidebar): Profile, Notifications, Appearance, Security
2. Profile tab (default): avatar with "Change" button, First Name, Last Name, Email, Phone
3. "Edit Profile" button
4. Notification Preferences: toggles for Email, Push, Meeting Reminders
5. Data bound to Supabase `profiles` table

**Design Reference:** Settings node `Op1Ni`

---

### Task 17: 404 Page

| Field | Value |
|---|---|
| **Priority** | Low |
| **Blocked by** | Task 3 |
| **Blocks** | None |
| **Branch** | `feat/task-17-404-page` |
| **Git Commit** | `feat: implement custom 404 not found page` |

**Scope:**
1. Custom 404 Not Found page at `/not-found.tsx`
2. Centered layout: "Page not found" heading, descriptive text, "Go to Dashboard" button
3. Consistent with app styling (theme variables, Inter font)
4. Works in both light and dark mode

**Design Reference:** 404 Page design from Task 0

---

### Task 18: Dark Mode, Theming & Responsive Polish

| Field | Value |
|---|---|
| **Priority** | Medium |
| **Blocked by** | Tasks 4–17 (all previous tasks) |
| **Blocks** | None |
| **Branch** | `feat/task-18-polish` |
| **Git Commit** | `feat: finalize dark mode, theming, and responsive design across all screens` |

**Scope:**
1. Verify dark mode renders correctly on ALL screens
2. Test all accent color themes (Default, Red, Rose, Orange, Green, Blue, Yellow, Violet)
3. Responsive breakpoints: mobile (<768px), tablet (768–1024px), desktop (>1024px)
4. Sidebar collapse to hamburger on mobile
5. Table horizontal scroll on mobile
6. Kanban horizontal scroll on mobile
7. Accessibility audit (focus states, aria labels, keyboard navigation)
8. Lighthouse accessibility score > 90

---

## Execution Order (Recommended)

Tasks can be parallelized where dependencies allow:

```
Sequential chain:
  Task 0 ──────────────────────────────────────────────────────────
  Task 1 → Task 2 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8
  Task 1 → Task 3 ↗                                      ↓
                                                    Task 13.5

Parallel after Task 7:
  Task 8, Task 9, Task 10, Task 11, Task 12, Task 13, Task 13.7

Parallel after Task 5:
  Task 14, Task 15, Task 16

Parallel after Task 6:
  Task 13.6

After Task 12:
  Task 13.8

After Task 15:
  Task 13.9

After Task 3:
  Task 17

Final:
  Task 18 (after ALL others)
```
