import type { SupabaseClient } from "@supabase/supabase-js";
import type { Comment } from "@/types/database";
import { getCurrentUserId } from "@/lib/queries/auth";

export async function createComment(
  client: SupabaseClient,
  input: { task_id: string; content: string }
) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");
  const { data, error } = await client
    .from("comments")
    .insert({
      task_id: input.task_id,
      content: input.content,
      author_id: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Comment;
}
