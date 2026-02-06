import type { SupabaseClient } from "@supabase/supabase-js";
import type { Comment } from "@/types/database";

export async function getCommentsByTask(
  client: SupabaseClient,
  taskId: string
) {
  const { data, error } = await client
    .from("comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}
