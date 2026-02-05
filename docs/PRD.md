# ProjectHub - Product Requirements Document (PRD)

> **Cross-references:** [Progress.md](./Progress.md) | [Tasks.md](./Tasks.md) | [Success_Requirements.md](./Success_Requirements.md)

---

## 1. Product Overview

**ProjectHub** is a project management web application designed for teams to manage projects, tasks, meetings, documents, and team members. The UI follows a consistent **Sidebar + Top Bar + Content Area** pattern built on the **shadcn/ui** design system with full light/dark mode theming support.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Backend/Auth | Supabase (Auth, Database, Storage) |
| State Management | React Context + Supabase Realtime |
| Forms | React Hook Form + Zod |
| Drag & Drop | @hello-pangea/dnd (for Kanban) |
| Charts | Recharts (for progress/dashboard) |
| Calendar | react-day-picker |
| Font | Inter (Google Fonts) |

---

## 3. Screens Inventory

### 3.1 Existing in Design File (14 screens)

| # | Screen | Design Node ID | Description |
|---|---|---|---|
| 1 | Login Page | `8rNQI` | Split-panel: branding left, login form right |
| 2 | Dashboard | `3AR0o` | Welcome banner, stat cards, project progress, deadlines, meetings |
| 3 | Project Board (Kanban) | `dPnmJ` | Drag-and-drop columns: Planning, In Progress, Review, Completed |
| 4 | Projects List | `SRj7b` | Table view of all projects with status, progress, due dates |
| 5 | Project Detail - Task Board | `V2jnf` | Kanban board scoped to a single project |
| 6 | Project Detail - Task List | `8QJUo` | Table/list view of tasks with sorting and filtering |
| 7 | Project Detail - Timeline | `ZAITU` | Gantt-style timeline with weekly view |
| 8 | Project Detail - Documents | `ZKFMd` | File grid with upload, categories, search |
| 9 | Project Detail - Meetings | `SDB6k` | Meeting list for a specific project |
| 10 | Project Detail - Progress | `6SmPk` | Overall progress %, task breakdown, recent activity |
| 11 | Task Detail Modal | `M20lk` | Modal: description, comments, assignee, due date, tags |
| 12 | Meetings Page | `6Svw1` | Global calendar + today's meetings sidebar |
| 13 | Team Members | `5u3Cr` | Card grid of team members with roles and contact |
| 14 | Settings | `Op1Ni` | Profile info, notification preferences, tabs |

### 3.2 Missing from Design (8 screens — added in Task 0)

| # | Screen | Type | Description |
|---|---|---|---|
| 15 | Sign Up Page | Full Page | Mirror of login layout with name, email, password, confirm password |
| 16 | Forgot Password Page | Full Page | Centered email form to request password reset |
| 17 | My Tasks Page | Full Page | Cross-project task list for the current user (sidebar + table) |
| 18 | Create/Edit Project Modal | Modal | Form: name, description, status, due date, team members |
| 19 | Create/Edit Task Modal | Modal | Form: title, description, status, priority, assignee, due date, tags |
| 20 | Schedule Meeting Modal | Modal | Form: title, date/time, duration, attendees, project, description |
| 21 | Invite Member Modal | Modal | Form: email, role, send invite |
| 22 | 404 Not Found Page | Full Page | Error message with navigation back to dashboard |

**Total: 22 screens/modals**

---

## 4. Navigation Structure

### 4.1 Sidebar (persistent on all authenticated pages)

**Main Section:**
- Dashboard (`layout-dashboard` icon)
- Projects (`folder-kanban` icon)
- My Tasks (`check-square` icon)
- Meetings (`calendar` icon)

**Team Section:**
- Team Members (`users` icon)
- Settings (`settings` icon)

### 4.2 Top Bar

- Left: Search input
- Right: Notification bell icon + User avatar

### 4.3 Project Detail Tabs

Task Board | Task List | Timeline | Documents | Meetings | Progress

---

## 5. Database Schema (Supabase)

### 5.1 Core Tables

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | References Supabase Auth `auth.users.id` |
| full_name | text | |
| avatar_url | text | Supabase Storage URL |
| email | text | |
| phone | text | |
| role | text | e.g., "Project Manager", "Designer" |
| department | text | e.g., "Design Team", "Engineering" |
| created_at | timestamptz | |

#### `projects`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| description | text | |
| status | text | "Planning", "In Progress", "Review", "Completed" |
| progress | integer | 0-100 |
| due_date | date | |
| created_by | uuid (FK) | References `profiles.id` |
| created_at | timestamptz | |

#### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| title | text | |
| description | text | |
| status | text | "To Do", "In Progress", "Review", "Done" |
| priority | text | "Low", "Medium", "High", "Urgent" |
| size | text | "S", "M", "L", "XL" |
| project_id | uuid (FK) | References `projects.id` |
| assignee_id | uuid (FK) | References `profiles.id` |
| due_date | date | |
| position | integer | For ordering within Kanban columns |
| created_at | timestamptz | |

#### `meetings`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| title | text | |
| description | text | |
| date | date | |
| time | time | |
| duration | interval | e.g., '1 hour' |
| project_id | uuid (FK) | References `projects.id` (nullable) |
| created_by | uuid (FK) | References `profiles.id` |
| created_at | timestamptz | |

#### `meeting_attendees`
| Column | Type | Notes |
|---|---|---|
| meeting_id | uuid (FK) | References `meetings.id` |
| profile_id | uuid (FK) | References `profiles.id` |
| PK | composite | (meeting_id, profile_id) |

#### `documents`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| file_size | bigint | Bytes |
| file_type | text | "pdf", "png", "xlsx", "json", etc. |
| category | text | "Design deliverables", "Project", etc. |
| storage_url | text | Supabase Storage path |
| project_id | uuid (FK) | References `projects.id` |
| uploaded_by | uuid (FK) | References `profiles.id` |
| created_at | timestamptz | |

#### `comments`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| content | text | |
| task_id | uuid (FK) | References `tasks.id` |
| author_id | uuid (FK) | References `profiles.id` |
| created_at | timestamptz | |

#### `tags`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| color | text | Hex color code |

#### `task_tags`
| Column | Type | Notes |
|---|---|---|
| task_id | uuid (FK) | References `tasks.id` |
| tag_id | uuid (FK) | References `tags.id` |
| PK | composite | (task_id, tag_id) |

#### `project_members`
| Column | Type | Notes |
|---|---|---|
| project_id | uuid (FK) | References `projects.id` |
| profile_id | uuid (FK) | References `profiles.id` |
| PK | composite | (project_id, profile_id) |

### 5.2 Row-Level Security

- All tables enforce RLS
- Users can only read/write data for projects they are members of
- Profile data is readable by all authenticated users
- Only project creators can delete projects
- Task CRUD scoped to project membership

---

## 6. Design System Details

### 6.1 CSS Variables (Light Mode)

```css
--background: 0 0% 100%
--foreground: 240 10% 3.9%
--card: 0 0% 100%
--card-foreground: 240 10% 3.9%
--popover: 0 0% 100%
--popover-foreground: 240 10% 3.9%
--primary: 240 5.9% 10%
--primary-foreground: 0 0% 98%
--secondary: 240 4.8% 95.9%
--secondary-foreground: 240 5.9% 10%
--muted: 240 4.8% 95.9%
--muted-foreground: 240 3.8% 46.1%
--accent: 240 4.8% 95.9%
--accent-foreground: 240 5.9% 10%
--destructive: 0 84.2% 60.2%
--destructive-foreground: 0 0% 98%
--border: 240 5.9% 90%
--input: 240 5.9% 90%
--ring: 240 5.9% 10%
```

### 6.2 Sidebar-Specific Variables

```css
--sidebar-background: 0 0% 98%
--sidebar-foreground: 240 5.3% 26.1%
--sidebar-primary: 240 5.9% 10%
--sidebar-primary-foreground: 0 0% 98%
--sidebar-accent: 240 4.8% 95.9%
--sidebar-accent-foreground: 240 5.9% 10%
--sidebar-border: 220 13% 91%
--sidebar-ring: 240 5.9% 10%
```

### 6.3 Typography

- **Font Family:** Inter (Google Fonts)
- **Heading sizes:** 24px (h1), 20px (h2), 16px (h3), 14px (h4)
- **Body text:** 14px
- **Small text / captions:** 12px

### 6.4 Component Library (shadcn/ui)

Used components: Button, Card, Input, Select, Dialog, Badge, Avatar, Table, Tabs, Calendar, Popover, DropdownMenu, Checkbox, Switch, Label, Textarea, Separator, ScrollArea, Tooltip

---

## 7. Design File Fixes (Pre-Development)

### Issue 1: Icon Button Text Clipping (All Screens)

**Affects:** Top Bar notification bell icon button on 12 screens + close button on Task Detail Modal

**Problem:** The `poRwU` text node inside Icon Button/Outline instances is `enabled: false` but still has `width: 44px`, overflowing the 36px icon button frame, causing "partially clipped" layout warnings.

**Fix:** Set `width: "fill_container"` on the `poRwU` text node in the base `hXOUF` (Icon Button/Outline) component so it respects the parent bounds. This propagates to all instances.

**Affected node IDs:** `cErYf`, `d2GU6`, `ZXaYT`, `IUffR`, `JOZzw`, `6DlrG`, `AIb7y`, `RkBx6`, `FGP3H`, `Jlx8G`, `wqsc1`, `WSTsu` (top bars), `lUHh4` (modal close button)

---

## 8. Git Workflow

1. Initialize repo: `git init && git remote add origin <github-repo-url>`
2. Each task = feature branch: `git checkout -b feat/task-{N}-{short-name}`
3. On completion: commit with descriptive message, push branch, merge to `main`
4. Format: `git commit -m "feat: <description>"` then `git push origin <branch>`
5. Total: **24 commits** (one per task, each pushed to GitHub)

---

## 9. Verification Plan

After all tasks are complete:

1. Run `npm run build` — no TypeScript or build errors
2. Run `npm run lint` — no linting errors
3. Manually test all 22 screens/modals in both light and dark mode
4. Test full auth flow: sign up, login (email + Google OAuth), forgot password, logout
5. Test CRUD operations: create/edit project, create/edit task, drag task between columns, upload document, schedule meeting, invite member
6. Test My Tasks page shows cross-project tasks for logged-in user
7. Test 404 page renders for unknown routes
8. Test on mobile viewport (375px width) — sidebar collapses, tables scroll, kanban scrolls
9. Verify all 24 git commits are pushed to GitHub
10. Run `mcp__pencil__snapshot_layout` with `problemsOnly: true` on all screens to verify no remaining design issues in `.pen` file
