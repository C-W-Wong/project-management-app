import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentUser(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export async function getCurrentUserId(client: SupabaseClient) {
  const user = await getCurrentUser(client);
  return user?.id ?? null;
}
