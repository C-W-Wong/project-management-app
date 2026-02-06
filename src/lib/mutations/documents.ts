import type { SupabaseClient } from "@supabase/supabase-js";
import type { Document } from "@/types/database";
import { getCurrentUserId } from "@/lib/queries/auth";

export async function uploadDocument(
  client: SupabaseClient,
  {
    projectId,
    file,
    category,
  }: { projectId: string; file: File; category?: string | null }
) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `${userId}/${projectId}/${Date.now()}-${safeName}`;

  const { data: storageData, error: storageError } = await client.storage
    .from("documents")
    .upload(path, file, { upsert: false });
  if (storageError) throw storageError;

  const publicUrl = client.storage.from("documents").getPublicUrl(path).data
    .publicUrl;

  const { data, error } = await client
    .from("documents")
    .insert({
      name: file.name,
      file_size: file.size,
      file_type: file.type || "file",
      category: category ?? null,
      storage_url: publicUrl,
      project_id: projectId,
      uploaded_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as Document;
}
