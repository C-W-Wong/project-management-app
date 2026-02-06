import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "@/types/database";

export type TaskInput = {
  title: string;
  description?: string | null;
  status?: Task["status"];
  priority?: Task["priority"];
  size?: Task["size"];
  project_id: string;
  assignee_id?: string | null;
  due_date?: string | null;
};

export async function createTask(client: SupabaseClient, input: TaskInput) {
  const { data, error } = await client
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "To Do",
      priority: input.priority ?? "Medium",
      size: input.size ?? null,
      project_id: input.project_id,
      assignee_id: input.assignee_id ?? null,
      due_date: input.due_date ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  client: SupabaseClient,
  taskId: string,
  updates: Partial<Task>
) {
  const { data, error } = await client
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTaskStatus(
  client: SupabaseClient,
  taskId: string,
  status: Task["status"],
  position?: number
) {
  const updates: Partial<Task> = { status };
  if (typeof position === "number") {
    updates.position = position;
  }
  const { data, error } = await client
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}
