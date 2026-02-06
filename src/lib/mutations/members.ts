import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectMember } from "@/types/database";

export async function addProjectMember(
  client: SupabaseClient,
  projectId: string,
  profileId: string
) {
  const { data, error } = await client
    .from("project_members")
    .insert({ project_id: projectId, profile_id: profileId })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProjectMember;
}

export async function addProjectMembers(
  client: SupabaseClient,
  projectId: string,
  profileIds: string[]
) {
  if (profileIds.length === 0) return [] as ProjectMember[];
  const payload = profileIds.map((profileId) => ({
    project_id: projectId,
    profile_id: profileId,
  }));
  const { data, error } = await client
    .from("project_members")
    .insert(payload)
    .select("*");
  if (error) throw error;
  return (data ?? []) as ProjectMember[];
}
