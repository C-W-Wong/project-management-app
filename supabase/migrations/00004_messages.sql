-- ============================================
-- MESSAGES TABLE
-- ============================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "Users can view their messages"
  on public.messages for select
  to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Users can send messages"
  on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid());

create policy "Users can update message read state"
  on public.messages for update
  to authenticated
  using (recipient_id = auth.uid());
