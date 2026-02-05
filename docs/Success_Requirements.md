# ProjectHub - Success Requirements

> **Cross-references:** [PRD.md](./PRD.md) | [Progress.md](./Progress.md) | [Tasks.md](./Tasks.md)

---

## Overview

This document defines the checklist-based success criteria for every task. A task is considered **complete** only when ALL of its checkboxes are checked and the git milestone is committed and pushed.

---

## PHASE 0: Design Fixes & Missing Screens

### Task 0: Fix Design Issues & Create Missing Screens in .pen File

- [ ] No "partially clipped" warnings on any screen after Icon Button fix
- [ ] Sign Up Page designed — mirrors Login layout, includes name + confirm password fields
- [ ] Forgot Password Page designed — centered email form with reset link button
- [ ] My Tasks Page designed — cross-project task table, consistent with existing layout
- [ ] Create/Edit Project Modal designed — uses shadcn/ui Dialog components
- [ ] Create/Edit Task Modal designed — includes all required form fields
- [ ] Schedule Meeting Modal designed — includes date/time, duration, attendees
- [ ] Invite Member Modal designed — email + role select + send button
- [ ] 404 Page designed — centered message with dashboard navigation
- [ ] All 8 missing pages/modals visually consistent with existing screens
- [ ] All modals use existing shadcn/ui Dialog/Modal component patterns
- [ ] New pages follow Sidebar + TopBar + Content layout pattern
- [ ] Layout validation passes on all screens (no remaining issues)
- [ ] **Git:** `feat: fix design issues and add missing screens to .pen file` committed + pushed

---

## PHASE 1: Foundation

### Task 1: Project Scaffolding & Configuration

- [ ] `npm run dev` starts without errors
- [ ] Tailwind CSS classes render correctly
- [ ] shadcn/ui Button component renders with correct theme tokens
- [ ] Light/dark mode toggle works
- [ ] All CSS variables from design file are mapped (see [PRD.md §6.1](./PRD.md#61-css-variables-light-mode))
- [ ] Supabase client initializes without errors
- [ ] Folder structure matches convention (`/app`, `/components`, `/lib`, `/types`, `/hooks`)
- [ ] ESLint + Prettier configured and running
- [ ] Inter font loads correctly
- [ ] **Git:** `feat: initialize Next.js project with Tailwind, shadcn/ui, Supabase, and theme configuration` committed + pushed

### Task 2: Supabase Database Schema & Auth Setup

- [ ] All tables created with correct relationships and foreign keys (see [PRD.md §5](./PRD.md#5-database-schema-supabase))
- [ ] RLS policies enforce user-level access on all tables
- [ ] Email/password signup and login works via Supabase Auth
- [ ] Google OAuth flow works via Supabase Auth
- [ ] Mock/seed data visible in Supabase dashboard (4 projects, 6 team members, sample tasks/meetings)
- [ ] Supabase client can query data from the Next.js app
- [ ] Auth helper utilities exist at `/lib/supabase/server.ts` and `/lib/supabase/client.ts`
- [ ] **Git:** `feat: set up Supabase schema, auth, RLS policies, and seed data` committed + pushed

### Task 3: Shared Layout Components (Sidebar + Top Bar)

- [ ] Sidebar renders with all nav items and correct Lucide icons
- [ ] Active route is visually highlighted in sidebar
- [ ] Sidebar footer shows user info from Supabase auth (avatar, name, role)
- [ ] TopBar search input renders on the left
- [ ] TopBar notification bell + user avatar render on the right
- [ ] AppLayout wrapper wraps all authenticated pages
- [ ] Breadcrumbs show correct hierarchy on project detail pages
- [ ] Responsive: sidebar collapses on mobile (<768px)
- [ ] **Git:** `feat: build shared layout with sidebar, top bar, and breadcrumbs` committed + pushed

---

## PHASE 2: Authentication

### Task 4: Login, Sign Up & Forgot Password Pages

- [ ] Login page visual match to design (split panel layout, typography, spacing) — node `8rNQI`
- [ ] Sign up page follows same split-panel layout pattern
- [ ] Forgot password page renders centered email form
- [ ] Email/password login works end-to-end with Supabase
- [ ] Email/password sign up creates account in Supabase
- [ ] Google OAuth login/signup works (Supabase OAuth provider)
- [ ] Forgot password sends reset email via Supabase
- [ ] Form validation shows inline errors on all 3 forms (React Hook Form + Zod)
- [ ] Redirect to `/dashboard` after successful login/signup
- [ ] Unauthenticated users redirected to `/login` (middleware)
- [ ] Navigation between `/login`, `/signup`, `/forgot-password` works correctly
- [ ] **Git:** `feat: implement login, sign up, and forgot password pages with Supabase auth` committed + pushed

---

## PHASE 3: Dashboard

### Task 5: Dashboard Page

- [ ] Visual match to dashboard design — node `3AR0o`
- [ ] Welcome banner displays "Welcome back, {name}" with user's name from Supabase
- [ ] 4 stat cards render with real data: Active Projects, Tasks Due Today, Upcoming Meetings, Team Members
- [ ] "Projects Progress" section shows project list with progress bars and percentages
- [ ] "Upcoming Deadlines" card shows list with colored priority dots (red/yellow/green) sorted by date
- [ ] "Upcoming Meetings" card shows time-based list with attendee avatars
- [ ] "+ New Project" button opens create project flow
- [ ] All data fetched from Supabase
- [ ] Page loads within 2 seconds
- [ ] **Git:** `feat: implement dashboard with stats, project progress, deadlines, and meetings` committed + pushed

---

## PHASE 4: Projects

### Task 6: Projects List Page

- [ ] Table renders all projects from Supabase — matches design node `SRj7b`
- [ ] Status badges color-coded: orange (In Progress), yellow (Review), green (Completed)
- [ ] Progress bars render with accurate percentages
- [ ] Team member avatar stacks display correctly
- [ ] Row click navigates to `/projects/[id]`
- [ ] Filter dropdown works by status
- [ ] "+ New Project" creation saves to Supabase
- [ ] **Git:** `feat: implement projects list page with table, filters, and create project` committed + pushed

### Task 7: Project Detail - Task Board (Kanban)

- [ ] Kanban columns render with tasks grouped by status — matches design nodes `dPnmJ` / `V2jnf`
- [ ] Drag-and-drop moves cards between columns and persists status change to Supabase
- [ ] Task cards display: title, description snippet, due date, priority badge, assignee avatar
- [ ] Tab navigation switches between project detail views (6 tabs)
- [ ] "+ Add Task" button creates a new task
- [ ] Filter button filters tasks
- [ ] Column task count badges update dynamically
- [ ] Project header shows: name, status badge, due date, member count
- [ ] **Git:** `feat: implement project detail kanban board with drag-and-drop` committed + pushed

### Task 8: Project Detail - Task List

- [ ] Task table renders all project tasks — matches design node `8QJUo`
- [ ] Status/Priority/Size badges color-coded correctly
- [ ] Column sorting works on all sortable columns
- [ ] Row click opens Task Detail Modal
- [ ] Checkbox toggles task completion status
- [ ] Shares data layer with Kanban view (same Supabase source of truth)
- [ ] **Git:** `feat: implement project detail task list view with sortable table` committed + pushed

### Task 9: Project Detail - Timeline

- [ ] Timeline renders tasks as horizontal bars across date columns — matches design node `ZAITU`
- [ ] Bars color-coded by task status/category
- [ ] Week navigation works (prev/next arrows)
- [ ] Task names align with their corresponding bars
- [ ] Responsive horizontal scrolling for many tasks
- [ ] Dates sourced from Supabase task data
- [ ] **Git:** `feat: implement project detail timeline/gantt view` committed + pushed

### Task 10: Project Detail - Documents

- [ ] Document grid renders files from Supabase Storage — matches design node `ZKFMd`
- [ ] File upload works and persists to Supabase Storage
- [ ] File type icons display correctly (PDF, image, spreadsheet, JSON)
- [ ] Category badges render on each card
- [ ] Search filters documents by name
- [ ] File download works on card click
- [ ] **Git:** `feat: implement project detail documents view with file upload` committed + pushed

### Task 11: Task Detail Modal

- [ ] Modal opens from Kanban cards and Task List rows — matches design node `M20lk`
- [ ] All fields populated from Supabase (title, status, priority, description, assignee, date, project, tags)
- [ ] Status and priority badges match design colors
- [ ] Comments render with correct author avatar, name, timestamp, message
- [ ] New comment saves to Supabase `comments` table
- [ ] Sidebar fields (assignee, date, project, tags) display correctly on muted background
- [ ] Close button (X) and backdrop click dismiss modal
- [ ] **Git:** `feat: implement task detail modal with comments and metadata` committed + pushed

### Task 12: Project Detail - Meetings

- [ ] Meeting list renders project-scoped meetings from Supabase — matches design node `SDB6k`
- [ ] Time and duration badge display correctly
- [ ] Attendee avatars render for each meeting
- [ ] "+ Schedule Meeting" button creates new meeting
- [ ] Meetings sorted by date/time
- [ ] **Git:** `feat: implement project detail meetings view` committed + pushed

### Task 13: Project Detail - Progress

- [ ] Overall progress bar renders with correct calculated percentage — matches design node `6SmPk`
- [ ] Summary stats match actual Supabase data: Total Tasks, Completed, In Progress, To Do
- [ ] "Task Progress by Status" bar chart segments proportional and color-coded (Recharts)
- [ ] "Recent Activity" feed shows real actions with avatar + description + timestamp
- [ ] All stats derived from live task data (not hardcoded)
- [ ] **Git:** `feat: implement project detail progress view with charts and activity feed` committed + pushed

---

## PHASE 4.5: My Tasks & CRUD Modals

### Task 13.5: My Tasks Page

- [ ] Table renders tasks filtered to current user from all projects
- [ ] Project column shows which project each task belongs to
- [ ] Status/Priority badges match design system colors
- [ ] Filters work: by status, priority, project
- [ ] Column sorting works correctly
- [ ] Row click opens Task Detail Modal
- [ ] Empty state displayed when user has no assigned tasks
- [ ] Page accessible from sidebar "My Tasks" nav item at `/tasks`
- [ ] **Git:** `feat: implement my tasks page with cross-project task list` committed + pushed

### Task 13.6: Create/Edit Project Modal

- [ ] Modal opens from Dashboard "+ New Project" button
- [ ] Modal opens from Projects List "+ New Project" button
- [ ] Create mode saves new project to Supabase
- [ ] Edit mode loads existing project data and saves updates
- [ ] Form validation: name required, valid date
- [ ] Team member multi-select works
- [ ] Modal closes and project list refreshes on save
- [ ] **Git:** `feat: implement create/edit project modal` committed + pushed

### Task 13.7: Create/Edit Task Modal

- [ ] Modal opens from Kanban "+ Add Task" button
- [ ] Modal opens from Task List "+ Add Task" button
- [ ] Create mode saves new task to Supabase with correct project reference
- [ ] Edit mode loads existing task data and saves updates
- [ ] Form validation: title required
- [ ] New task appears in correct Kanban column / table row after creation
- [ ] **Git:** `feat: implement create/edit task modal` committed + pushed

### Task 13.8: Schedule Meeting Modal

- [ ] Modal opens from global Meetings page "+ Schedule Meeting" button
- [ ] Modal opens from Project Meetings "+ Schedule Meeting" button
- [ ] All form fields functional: title, date, time, duration, project, attendees, description
- [ ] Meeting saves to Supabase with correct attendees and project reference
- [ ] New meeting appears in calendar and meeting lists after creation
- [ ] **Git:** `feat: implement schedule meeting modal` committed + pushed

### Task 13.9: Invite Member Modal

- [ ] Modal opens from Team Members page "+ Invite Member" button
- [ ] Email field validates correctly (valid email format)
- [ ] Role select offers appropriate options (Project Manager, Designer, Developer, QA Engineer, etc.)
- [ ] Invite sends email or creates pending member record in Supabase
- [ ] Success confirmation message shown to user after invite
- [ ] **Git:** `feat: implement invite member modal` committed + pushed

---

## PHASE 5: Meetings & Team

### Task 14: Meetings Page (Global)

- [ ] Calendar renders current month with day grid — matches design node `6Svw1`
- [ ] Calendar navigation arrows switch months
- [ ] "Today" button returns to current date
- [ ] "Today's Meetings" list shows meetings from Supabase for selected date
- [ ] "+ Schedule Meeting" button opens create meeting dialog
- [ ] Clicking a calendar date filters meetings for that day
- [ ] Attendee avatars render correctly in meeting list
- [ ] **Git:** `feat: implement global meetings page with calendar and meeting list` committed + pushed

### Task 15: Team Members Page

- [ ] Team member cards render from Supabase data — matches design node `5u3Cr`
- [ ] Avatar colors vary per member (colored circle with initials)
- [ ] Department badges color-coded per department
- [ ] Contact info displayed: email and phone
- [ ] "+ Invite Member" button triggers invite flow
- [ ] Card grid responsive: 3 cols → 2 cols → 1 col
- [ ] "Message" and "Profile" action buttons present on each card
- [ ] **Git:** `feat: implement team members page with member cards and invite flow` committed + pushed

---

## PHASE 6: Settings & Polish

### Task 16: Settings Page

- [ ] Settings tabs (Profile, Notifications, Appearance, Security) switch content — matches design node `Op1Ni`
- [ ] Profile form displays current user data from Supabase `profiles` table
- [ ] "Edit Profile" saves changes to Supabase
- [ ] Avatar "Change" button uploads new avatar to Supabase Storage
- [ ] Notification toggles (Email, Push, Meeting Reminders) persist state
- [ ] Form validation on profile fields (email format, required fields)
- [ ] **Git:** `feat: implement settings page with profile and notification preferences` committed + pushed

### Task 17: 404 Page

- [ ] 404 page renders for unknown/invalid routes
- [ ] "Go to Dashboard" button navigates to `/dashboard`
- [ ] Visual consistency with rest of app (theme variables, Inter font)
- [ ] Works correctly in both light and dark mode
- [ ] **Git:** `feat: implement custom 404 not found page` committed + pushed

### Task 18: Dark Mode, Theming & Responsive Polish

- [ ] All 22 screens/modals render correctly in dark mode
- [ ] Theme accent colors apply globally (Default, Red, Rose, Orange, Green, Blue, Yellow, Violet)
- [ ] Mobile layout (<768px) usable on all screens
- [ ] Tablet layout (768–1024px) renders correctly
- [ ] No horizontal overflow or broken layouts at any breakpoint
- [ ] Sidebar collapses to hamburger menu on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Kanban board scrolls horizontally on mobile
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus states visible on all focusable elements
- [ ] Aria labels present on interactive elements
- [ ] Lighthouse accessibility score > 90
- [ ] **Git:** `feat: finalize dark mode, theming, and responsive design across all screens` committed + pushed

---

## Final Verification Checklist

After all 24 tasks are complete, verify:

- [ ] `npm run build` — no TypeScript or build errors
- [ ] `npm run lint` — no linting errors
- [ ] All 22 screens/modals tested in light mode
- [ ] All 22 screens/modals tested in dark mode
- [ ] Full auth flow tested: sign up → login (email) → login (Google OAuth) → forgot password → logout
- [ ] CRUD tested: create project → edit project → create task → edit task → drag task → upload document → schedule meeting → invite member
- [ ] My Tasks page shows cross-project tasks for logged-in user
- [ ] 404 page renders for `/nonexistent-route`
- [ ] Mobile viewport (375px) tested: sidebar collapses, tables scroll, kanban scrolls
- [ ] All 24 git commits present and pushed to GitHub
- [ ] `mcp__pencil__snapshot_layout` with `problemsOnly: true` confirms no design issues on any screen
