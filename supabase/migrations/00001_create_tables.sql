-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  email text not null,
  phone text,
  role text,
  department text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- ============================================
-- PROJECTS TABLE
-- ============================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  status text not null default 'Planning' check (status in ('Planning', 'In Progress', 'Review', 'Completed')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  due_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.projects enable row level security;

-- ============================================
-- PROJECT MEMBERS TABLE
-- ============================================
create table public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  primary key (project_id, profile_id)
);

alter table public.project_members enable row level security;

create policy "Project members are viewable by authenticated users"
  on public.project_members for select
  to authenticated
  using (true);

create policy "Project creators can manage members"
  on public.project_members for all
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where id = project_id and created_by = auth.uid()
    )
  );

create policy "Members can add themselves"
  on public.project_members for insert
  to authenticated
  with check (profile_id = auth.uid());

-- Projects policies (depend on project_members)
create policy "Projects are viewable by members"
  on public.projects for select
  to authenticated
  using (
    created_by = auth.uid() or
    exists (
      select 1 from public.project_members
      where project_id = id and profile_id = auth.uid()
    )
  );

create policy "Authenticated users can create projects"
  on public.projects for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Project creators can update projects"
  on public.projects for update
  to authenticated
  using (created_by = auth.uid());

create policy "Only project creators can delete projects"
  on public.projects for delete
  to authenticated
  using (created_by = auth.uid());

-- ============================================
-- TAGS TABLE
-- ============================================
create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text not null
);

alter table public.tags enable row level security;

create policy "Tags are viewable by authenticated users"
  on public.tags for select
  to authenticated
  using (true);

create policy "Authenticated users can create tags"
  on public.tags for insert
  to authenticated
  with check (true);

-- ============================================
-- TASKS TABLE
-- ============================================
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default 'To Do' check (status in ('To Do', 'In Progress', 'Review', 'Done')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  size text check (size in ('S', 'M', 'L', 'XL')),
  project_id uuid references public.projects(id) on delete cascade not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  position integer not null default 0,
  created_at timestamptz default now() not null
);

alter table public.tasks enable row level security;

create policy "Tasks are viewable by project members"
  on public.tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.project_members
      where project_id = tasks.project_id and profile_id = auth.uid()
    ) or
    exists (
      select 1 from public.projects
      where id = tasks.project_id and created_by = auth.uid()
    )
  );

create policy "Project members can create tasks"
  on public.tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.project_members
      where project_id = tasks.project_id and profile_id = auth.uid()
    ) or
    exists (
      select 1 from public.projects
      where id = tasks.project_id and created_by = auth.uid()
    )
  );

create policy "Project members can update tasks"
  on public.tasks for update
  to authenticated
  using (
    exists (
      select 1 from public.project_members
      where project_id = tasks.project_id and profile_id = auth.uid()
    ) or
    exists (
      select 1 from public.projects
      where id = tasks.project_id and created_by = auth.uid()
    )
  );

create policy "Project members can delete tasks"
  on public.tasks for delete
  to authenticated
  using (
    exists (
      select 1 from public.project_members
      where project_id = tasks.project_id and profile_id = auth.uid()
    ) or
    exists (
      select 1 from public.projects
      where id = tasks.project_id and created_by = auth.uid()
    )
  );

-- ============================================
-- TASK TAGS TABLE
-- ============================================
create table public.task_tags (
  task_id uuid references public.tasks(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

alter table public.task_tags enable row level security;

create policy "Task tags are viewable by authenticated users"
  on public.task_tags for select
  to authenticated
  using (true);

create policy "Project members can manage task tags"
  on public.task_tags for all
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.project_members pm on pm.project_id = t.project_id
      where t.id = task_id and pm.profile_id = auth.uid()
    )
  );

-- ============================================
-- MEETINGS TABLE
-- ============================================
create table public.meetings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  date date not null,
  time time not null,
  duration interval not null default '1 hour',
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.meetings enable row level security;

create policy "Meetings are viewable by authenticated users"
  on public.meetings for select
  to authenticated
  using (true);

create policy "Authenticated users can create meetings"
  on public.meetings for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Meeting creators can update meetings"
  on public.meetings for update
  to authenticated
  using (created_by = auth.uid());

create policy "Meeting creators can delete meetings"
  on public.meetings for delete
  to authenticated
  using (created_by = auth.uid());

-- ============================================
-- MEETING ATTENDEES TABLE
-- ============================================
create table public.meeting_attendees (
  meeting_id uuid references public.meetings(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  primary key (meeting_id, profile_id)
);

alter table public.meeting_attendees enable row level security;

create policy "Meeting attendees are viewable by authenticated users"
  on public.meeting_attendees for select
  to authenticated
  using (true);

create policy "Meeting creators can manage attendees"
  on public.meeting_attendees for all
  to authenticated
  using (
    exists (
      select 1 from public.meetings
      where id = meeting_id and created_by = auth.uid()
    )
  );

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  file_size bigint not null default 0,
  file_type text not null,
  category text,
  storage_url text not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.documents enable row level security;

create policy "Documents are viewable by project members"
  on public.documents for select
  to authenticated
  using (
    exists (
      select 1 from public.project_members
      where project_id = documents.project_id and profile_id = auth.uid()
    ) or
    exists (
      select 1 from public.projects
      where id = documents.project_id and created_by = auth.uid()
    )
  );

create policy "Project members can upload documents"
  on public.documents for insert
  to authenticated
  with check (
    exists (
      select 1 from public.project_members
      where project_id = documents.project_id and profile_id = auth.uid()
    ) or
    exists (
      select 1 from public.projects
      where id = documents.project_id and created_by = auth.uid()
    )
  );

create policy "Document uploaders can delete"
  on public.documents for delete
  to authenticated
  using (uploaded_by = auth.uid());

-- ============================================
-- COMMENTS TABLE
-- ============================================
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "Comments are viewable by authenticated users"
  on public.comments for select
  to authenticated
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "Comment authors can update their comments"
  on public.comments for update
  to authenticated
  using (author_id = auth.uid());

create policy "Comment authors can delete their comments"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid());

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
