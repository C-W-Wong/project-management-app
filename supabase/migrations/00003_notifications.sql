-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.notifications enable row level security;

create policy "Users can view their notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their notifications"
  on public.notifications for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());
