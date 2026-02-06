# Step 2: Making ProjectHub Fully Functional

> **Current state:** The UI is 100% complete, authentication works, and the database schema is production-ready. But **zero CRUD operations are connected to the database** — every page uses hardcoded mock data and every modal logs to console instead of saving.

---

## Table of Contents

1. [Pages Using Mock Data](#1-pages-using-mock-data)
2. [Buttons That Don't Work](#2-buttons-that-dont-work)
3. [Modals That Never Open](#3-modals-that-never-open)
4. [Forms That Don't Save](#4-forms-that-dont-save)
5. [Features Not Yet Wired Up](#5-features-not-yet-wired-up)
6. [Missing Loading, Error, and Empty States](#6-missing-loading-error-and-empty-states)
7. [Database Integration Gap](#7-database-integration-gap)
8. [Implementation Order](#8-recommended-implementation-order)

---

## 1. Pages Using Mock Data

Every dashboard page renders hardcoded arrays instead of fetching from Supabase.

### Dashboard (`src/app/(dashboard)/dashboard/page.tsx`)

| Mock Array | Lines | Content |
|---|---|---|
| `stats` | 22–47 | 4 stat cards (Active Projects: 12, Tasks Due Today: 8, Upcoming Meetings: 3, Team Members: 24) |
| `projects` | 49–54 | 4 projects with hardcoded progress % and statuses |
| `deadlines` | 56–75 | 3 tasks with hardcoded dates and priorities |
| `meetings` | 77–96 | 3 meetings with hardcoded attendees and times |

### Projects List (`src/app/(dashboard)/projects/page.tsx`)

| Mock Array | Lines | Content |
|---|---|---|
| `projects` | 26–63 | 4 projects with IDs 1–4, statuses, member counts |

- Status filter works but is local-only (not persisted).

### Project Detail (`src/app/(dashboard)/projects/[id]/page.tsx`)

| Mock Array | Lines | Content |
|---|---|---|
| `projectData` | 18–24 | Single hardcoded project object |

- **Critical bug:** `useParams()` is called (line 27) but the `[id]` parameter is never used — every project shows the same data.
- All tab content components (`KanbanBoard`, `TaskList`, `DocumentsView`, `MeetingsView`, `TimelineView`, `ProgressView`) use their own internal mock data.

### My Tasks (`src/app/(dashboard)/tasks/page.tsx`)

| Mock Array | Lines | Content |
|---|---|---|
| `myTasks` | 35–42 | 6 hardcoded tasks |

- Checkbox toggle works locally but is not saved to database (lines 74–78).
- Filter by status works (local state only).

### Meetings (`src/app/(dashboard)/meetings/page.tsx`)

| Mock Array | Lines | Content |
|---|---|---|
| `meetingsByDate` | 11–26 | 5 meetings across 3 dates |

- Calendar navigation and day selection work (local state).

### Team (`src/app/(dashboard)/team/page.tsx`)

| Mock Array | Lines | Content |
|---|---|---|
| `teamMembers` | 19–26 | 6 team members with roles, departments, avatars |

### Settings (`src/app/(dashboard)/settings/page.tsx`)

- Profile tab: displays hardcoded placeholder values, not the current user's profile.
- Notification toggles: have `defaultChecked` but no `onChange` handlers to persist.

---

## 2. Buttons That Don't Work

Every button below either has no `onClick` handler or the handler does nothing.

| Page | Button | Location | Issue |
|---|---|---|---|
| Dashboard | "New Project" | `dashboard/page.tsx:122` | No onClick, no modal trigger |
| Dashboard | "View All" (Projects) | `dashboard/page.tsx:158` | No onClick |
| Dashboard | "View All" (Deadlines) | `dashboard/page.tsx:193` | No onClick |
| Dashboard | "View All" (Meetings) | `dashboard/page.tsx:229` | No onClick |
| Projects List | "New Project" | `projects/page.tsx:123` | No modal trigger |
| Projects List | Settings icon (per card) | `projects/page.tsx:194` | No onClick |
| Project Detail | "Filter" | `projects/[id]/page.tsx:73` | No handler |
| Project Detail | "Add Task" | `projects/[id]/page.tsx:77` | No modal trigger |
| Meetings | "Schedule Meeting" | `meetings/page.tsx:89` | No modal trigger |
| Team | "Invite Member" | `team/page.tsx:49` | No modal trigger |
| Team | "Message" (x6) | `team/page.tsx:84` | No handler |
| Team | "Profile" (x6) | `team/page.tsx:88` | No handler |
| Settings | "Change Avatar" | `settings/page.tsx:75` | No file picker / upload |
| Settings | "Edit Profile" | `settings/page.tsx:103` | No save handler |
| Settings | "Update Password" | `settings/page.tsx:187` | No save handler |

**Total: 18+ non-functional buttons across the app.**

---

## 3. Modals That Never Open

All 4 CRUD modals are fully built (with form validation via react-hook-form + zod) but **no button in the app triggers them**.

| Modal | File | Trigger Buttons (Currently Disconnected) |
|---|---|---|
| Create Project | `src/components/modals/create-project-modal.tsx` | Dashboard "New Project", Projects "New Project" |
| Create Task | `src/components/modals/create-task-modal.tsx` | Project Detail "Add Task" |
| Schedule Meeting | `src/components/modals/schedule-meeting-modal.tsx` | Meetings "Schedule Meeting" |
| Invite Member | `src/components/modals/invite-member-modal.tsx` | Team "Invite Member" |

Each modal needs:
1. State management (`useState` for `open`/`setOpen`) on the parent page
2. The modal component rendered on the parent page
3. The trigger button wired to `setOpen(true)`

---

## 4. Forms That Don't Save

Every form in the app either logs to console or does nothing on submit.

### Modal Forms (console.log only)

| Form | File | Submit Handler | What Happens |
|---|---|---|---|
| Create/Edit Project | `create-project-modal.tsx:73–79` | `console.log()` + `// TODO: Save to Supabase` | Logs form data, closes modal |
| Create/Edit Task | `create-task-modal.tsx:76–82` | `console.log()` + `// TODO: Save to Supabase` | Logs form data, closes modal |
| Schedule Meeting | `schedule-meeting-modal.tsx:59–65` | `console.log()` + `// TODO: Save to Supabase` | Logs form data, closes modal |
| Invite Member | `invite-member-modal.tsx:51–58` | `console.log()` + `// TODO: Send invite via Supabase` | Logs data, shows fake success UI |

### Settings Forms (no handler at all)

| Form | File | Issue |
|---|---|---|
| Edit Profile | `settings/page.tsx` (ProfileTab, line 103) | Button has no onClick |
| Update Password | `settings/page.tsx` (SecurityTab, line 187) | Button has no onClick |
| Notification Toggles | `settings/page.tsx` (NotificationsTab, lines 110–148) | Switches render but changes aren't saved |

### Hardcoded Dropdowns in Modals

| Modal | Field | Issue |
|---|---|---|
| Create Task | Assignee dropdown (lines 155–158) | 3 hardcoded user names instead of querying `profiles` |
| Schedule Meeting | Project dropdown (lines 131–134) | 4 hardcoded project names instead of querying `projects` |

---

## 5. Features Not Yet Wired Up

### Search
- **Status:** Not implemented anywhere.
- No search bar, no search API, no full-text search queries.

### Notifications
- Bell icon is visible in the header UI.
- Settings page has notification preference toggles.
- **No notification system exists** — no table, no real-time subscription, no push/email.

### File Upload / Documents
- `documents` table exists in the database schema (migration line 298).
- `documents` and `avatars` storage buckets are defined in `00002_storage.sql`.
- Storage RLS policies are written.
- **Zero upload functionality is implemented** — no file picker, no `supabase.storage.upload()`, no document list fetching.

### Avatar Upload
- "Change Avatar" button exists on settings page.
- `avatars` storage bucket is defined.
- **No file picker or upload handler.**

### Kanban Drag-and-Drop Persistence
- Kanban board UI works for dragging tasks between columns.
- **Column changes are not saved to the database** — refreshing the page resets everything.

### Task Completion Persistence
- Checkboxes toggle in the My Tasks page.
- **Status changes are not saved** — refreshing the page resets all checkboxes.

### "View All" Navigation
- Dashboard has 3 "View All" links (projects, deadlines, meetings).
- **None of them navigate anywhere.**

### Team Member Actions
- "Message" and "Profile" buttons exist on every team member card.
- **No messaging system or profile view pages exist.**

---

## 6. Missing Loading, Error, and Empty States

### Empty States

| Page | Has Empty State? | Details |
|---|---|---|
| My Tasks | Yes | "No tasks found" message (lines 117–125) |
| Meetings | Yes | "No meetings scheduled" message (lines 167–170) |
| Dashboard | No | — |
| Projects List | No | — |
| Project Detail | No | — |
| Team | No | — |
| Settings | No | — |

### Loading States

- **No page has loading states.** No skeleton loaders, no spinners, no `Suspense` boundaries.
- Modal buttons do have `loading` state variables with "Saving..."/"Scheduling..." text, but since operations are instant (`console.log`), the loading state is never actually visible.

### Error States

- **No error boundaries anywhere** in the app.
- **No error messages** for failed operations.
- **No retry mechanisms.**
- **No network error handling.**
- **No toast/notification system** for success or failure feedback.

---

## 7. Database Integration Gap

### What Works (Real Integration)

**Authentication only:**
- Login (`src/app/(auth)/login/page.tsx`)
- Signup (`src/app/(auth)/signup/page.tsx`)
- Password reset (`src/app/(auth)/forgot-password/page.tsx`)
- Google OAuth
- Auto profile creation on signup (database trigger, migration lines 381–397)

### Schema Is Complete But Unused

The full schema exists in `supabase/migrations/00001_create_tables.sql`:

| Table | Migration Lines | Queried? | Notes |
|---|---|---|---|
| `profiles` | 7–16 | Only on auth trigger | Not read by any page |
| `projects` | 38–47 | No | — |
| `project_members` | 54–58 | No | — |
| `tasks` | 133–145 | No | — |
| `tags` | 112–116 | No | — |
| `task_tags` | 208–212 | No | — |
| `meetings` | 235–245 | No | — |
| `meeting_attendees` | 272–276 | No | — |
| `documents` | 298–308 | No | — |
| `comments` | 348–354 | No | — |

**RLS policies** are fully defined (25+) for all tables — ready to use.

**Storage buckets** defined in `00002_storage.sql`:
- `documents` bucket (line 2) — unused
- `avatars` bucket (line 5) — unused
- Storage RLS policies (lines 8–37) — unused

### Zero Supabase Data Queries Exist

Outside of auth, the codebase makes no calls to:
- `supabase.from('...').select()`
- `supabase.from('...').insert()`
- `supabase.from('...').update()`
- `supabase.from('...').delete()`
- `supabase.storage.from('...').upload()`
- `supabase.storage.from('...').download()`
- Any real-time subscriptions

### Pages That Need Database Integration

| Page | Tables Needed | Query Type |
|---|---|---|
| Dashboard | `projects`, `tasks`, `meetings`, `profiles` | SELECT with aggregations |
| Projects List | `projects` + `project_members` | SELECT with JOIN |
| Project Detail | `projects`, `tasks`, `documents`, `meetings` | SELECT by ID with JOINs |
| My Tasks | `tasks` | SELECT WHERE assignee_id = current user |
| Meetings | `meetings` + `meeting_attendees` | SELECT with JOIN |
| Team | `profiles` + `project_members` | SELECT all team members |
| Settings | `profiles` | SELECT + UPDATE current user |

### Components That Need Database Integration

| Component | Tables Needed | Operations |
|---|---|---|
| CreateProjectModal | `projects`, `project_members` | INSERT |
| CreateTaskModal | `tasks`, `task_tags` | INSERT |
| ScheduleMeetingModal | `meetings`, `meeting_attendees` | INSERT |
| InviteMemberModal | `project_members` | INSERT |
| KanbanBoard | `tasks` | SELECT + UPDATE (drag-and-drop) |
| TaskList | `tasks` | SELECT + UPDATE (status toggle) |
| DocumentsView | `documents` + storage | SELECT + UPLOAD |
| MeetingsView | `meetings` | SELECT (project-scoped) |
| TimelineView | `tasks` | SELECT (for timeline rendering) |
| ProgressView | `tasks` | SELECT (for progress calculation) |

---

## 8. Recommended Implementation Order

### Phase 1: Data Layer Foundation
1. Create a `src/lib/queries/` directory with typed Supabase query functions for each table.
2. Create a `src/lib/mutations/` directory for insert/update/delete operations.
3. Add React Query (or SWR) for client-side caching and refetching.

### Phase 2: Wire Up Read Operations (Replace Mock Data)
4. Dashboard — fetch real stats, projects, tasks, meetings.
5. Projects List — query `projects` table with member counts.
6. Project Detail — use `[id]` param to fetch the correct project + tabs.
7. My Tasks — query `tasks` where `assignee_id = current_user`.
8. Meetings — query `meetings` with `meeting_attendees`.
9. Team — query `profiles` for team members.
10. Settings — load current user profile from `profiles`.

### Phase 3: Wire Up Write Operations (Modals + Forms)
11. Wire Create Project modal to "New Project" buttons + replace `console.log` with `INSERT`.
12. Wire Create Task modal to "Add Task" button + replace `console.log` with `INSERT`.
13. Wire Schedule Meeting modal to "Schedule Meeting" button + replace `console.log` with `INSERT`.
14. Wire Invite Member modal to "Invite Member" button + replace `console.log` with `INSERT`.
15. Wire Settings forms to `UPDATE profiles` + avatar upload to storage.
16. Wire task checkbox toggles to `UPDATE tasks`.
17. Wire Kanban drag-and-drop to `UPDATE tasks` status/position.

### Phase 4: UX Polish
18. Add loading skeletons to all pages.
19. Add error boundaries and error states.
20. Add toast notifications for success/failure feedback.
21. Add empty states to pages that lack them.
22. Replace hardcoded dropdowns in modals with dynamic queries.

### Phase 5: Remaining Features
23. Implement global search (full-text search on projects, tasks, meetings).
24. Implement notification system (real-time with Supabase subscriptions).
25. Implement file upload for documents.
26. Wire "View All" buttons to navigate to the correct pages.
27. Add "Message" and "Profile" functionality for team members (or remove buttons).
28. Add password change functionality in settings.

---

## Summary

| Category | Count |
|---|---|
| Pages with mock data | 7 |
| Non-functional buttons | 18+ |
| Modals built but never triggered | 4 |
| Forms that don't save | 7 |
| Database tables created but unused | 10 |
| Storage buckets created but unused | 2 |
| RLS policies defined but inactive | 25+ |
| Missing loading states | 7 pages |
| Missing error handling | All pages |
| Features not implemented | 6+ (search, notifications, file upload, etc.) |
