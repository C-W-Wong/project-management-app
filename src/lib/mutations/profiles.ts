import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { getCurrentUserId } from "@/lib/queries/auth";

export type ProfileUpdates = Partial<
  Pick<Profile, "full_name" | "email" | "phone" | "role" | "department" | "avatar_url">
>;

export async function updateProfile(
  client: SupabaseClient,
  updates: ProfileUpdates
) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");
  const { data, error } = await client
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function uploadAvatar(client: SupabaseClient, file: File) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error: storageError } = await client.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (storageError) throw storageError;

  const publicUrl = client.storage.from("avatars").getPublicUrl(path).data
    .publicUrl;

  return updateProfile(client, { avatar_url: publicUrl });
}
