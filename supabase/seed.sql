-- ============================================
-- SEED DATA FOR PROJECTHUB
-- ============================================
-- Note: Run this after creating test users via Supabase Auth.
-- The UUIDs below are placeholders - replace with actual auth.users IDs.

-- Sample profiles (these would normally be created by the trigger)
-- For development, insert mock data directly

-- Tags
insert into public.tags (id, name, color) values
  ('a1000000-0000-0000-0000-000000000001', 'Frontend', '#3B82F6'),
  ('a1000000-0000-0000-0000-000000000002', 'Backend', '#10B981'),
  ('a1000000-0000-0000-0000-000000000003', 'Design', '#8B5CF6'),
  ('a1000000-0000-0000-0000-000000000004', 'Bug', '#EF4444'),
  ('a1000000-0000-0000-0000-000000000005', 'Feature', '#F59E0B'),
  ('a1000000-0000-0000-0000-000000000006', 'Documentation', '#6B7280'),
  ('a1000000-0000-0000-0000-000000000007', 'Testing', '#EC4899'),
  ('a1000000-0000-0000-0000-000000000008', 'DevOps', '#14B8A6');
