import type { SupabaseClient } from "@supabase/supabase-js";
import type { Document } from "@/types/database";

export async function getDocumentsByProject(
  client: SupabaseClient,
  projectId: string
) {
  const { data, error } = await client
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Document[];
}
