-- Fix circular RLS recursion between projects and project_members

-- Drop the overly broad policy that includes SELECT
DROP POLICY IF EXISTS "Project creators can manage members" ON public.project_members;

-- Recreate more specific policies without SELECT
CREATE POLICY "Project creators can insert members"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    exists (
      select 1 from public.projects
      where id = project_id and created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can update members"
  ON public.project_members FOR UPDATE
  TO authenticated
  USING (
    exists (
      select 1 from public.projects
      where id = project_id and created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can delete members"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    exists (
      select 1 from public.projects
      where id = project_id and created_by = auth.uid()
    )
  );
