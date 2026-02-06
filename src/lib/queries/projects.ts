import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project, Profile } from "@/types/database";
import { getProfilesByIds } from "./profiles";

export type ProjectSummary = Project & {
  members: Profile[];
  memberCount: number;
};

export async function getProjects(client: SupabaseClient) {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProjectById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Project;
}

export async function getProjectMembers(client: SupabaseClient, projectId: string) {
  const { data, error } = await client
    .from("project_members")
    .select("profile_id")
    .eq("project_id", projectId);
  if (error) throw error;
  const ids = (data ?? []).map((row) => row.profile_id).filter(Boolean);
  return getProfilesByIds(client, ids);
}

export async function getProjectsWithMembers(client: SupabaseClient) {
  const projects = await getProjects(client);
  if (projects.length === 0) return [] as ProjectSummary[];
  const projectIds = projects.map((p) => p.id);

  const { data: membersData, error: membersError } = await client
    .from("project_members")
    .select("project_id, profile_id")
    .in("project_id", projectIds);
  if (membersError) throw membersError;

  const memberIds = Array.from(
    new Set((membersData ?? []).map((row) => row.profile_id).filter(Boolean))
  ) as string[];
  const profiles = await getProfilesByIds(client, memberIds);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const membersByProject = new Map<string, Profile[]>();
  for (const row of membersData ?? []) {
    const profile = profileMap.get(row.profile_id);
    if (!profile) continue;
    const list = membersByProject.get(row.project_id) ?? [];
    list.push(profile);
    membersByProject.set(row.project_id, list);
  }

  return projects.map((project) => {
    const members = membersByProject.get(project.id) ?? [];
    return {
      ...project,
      members,
      memberCount: members.length,
    } satisfies ProjectSummary;
  });
}
