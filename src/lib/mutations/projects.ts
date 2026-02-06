import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types/database";
import { getCurrentUserId } from "@/lib/queries/auth";
import { addProjectMember } from "./members";

export type ProjectInput = {
  name: string;
  description?: string | null;
  status?: Project["status"];
  due_date?: string | null;
};

export async function createProject(
  client: SupabaseClient,
  input: ProjectInput
) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");
  const { data, error } = await client
    .from("projects")
    .insert({
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "Planning",
      due_date: input.due_date ?? null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  if (data?.id) {
    await addProjectMember(client, data.id, userId);
  }
  return data as Project;
}

export async function updateProject(
  client: SupabaseClient,
  projectId: string,
  updates: ProjectInput
) {
  const { data, error } = await client
    .from("projects")
    .update({
      name: updates.name,
      description: updates.description ?? null,
      status: updates.status,
      due_date: updates.due_date ?? null,
    })
    .eq("id", projectId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Project;
}
