import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task, Profile } from "@/types/database";
import { getProfilesByIds } from "./profiles";
import { getCurrentUserId } from "./auth";

export type TaskWithAssignee = Task & {
  assignee?: Profile | null;
};

export async function getTasksByProject(
  client: SupabaseClient,
  projectId: string
) {
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  const tasks = (data ?? []) as Task[];
  return attachAssignees(client, tasks);
}

export async function getTasksForUser(
  client: SupabaseClient,
  userId?: string
) {
  const resolvedUserId = userId ?? (await getCurrentUserId(client));
  if (!resolvedUserId) return [] as TaskWithAssignee[];
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .eq("assignee_id", resolvedUserId)
    .order("due_date", { ascending: true });
  if (error) throw error;
  const tasks = (data ?? []) as Task[];
  return attachAssignees(client, tasks);
}

export async function getTasksByIds(client: SupabaseClient, ids: string[]) {
  if (ids.length === 0) return [] as Task[];
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function getTaskCountsByStatus(
  client: SupabaseClient,
  projectId: string
) {
  const tasks = await getTasksByProject(client, projectId);
  return tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {});
}

async function attachAssignees(client: SupabaseClient, tasks: Task[]) {
  const assigneeIds = Array.from(
    new Set(tasks.map((task) => task.assignee_id).filter(Boolean))
  ) as string[];
  const profiles = await getProfilesByIds(client, assigneeIds);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  return tasks.map((task) => ({
    ...task,
    assignee: task.assignee_id ? profileMap.get(task.assignee_id) ?? null : null,
  })) as TaskWithAssignee[];
}
