-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================
create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default true,
  meeting_reminders boolean not null default true,
  updated_at timestamptz default now() not null
);

alter table public.notification_preferences enable row level security;

create policy "Users can view their notification preferences"
  on public.notification_preferences for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update their notification preferences"
  on public.notification_preferences for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can modify their notification preferences"
  on public.notification_preferences for update
  to authenticated
  using (user_id = auth.uid());
