import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { getCurrentUserId } from "./auth";

export async function getProfileById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getProfilesByIds(
  client: SupabaseClient,
  ids: string[]
) {
  if (ids.length === 0) return [] as Profile[];
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getAllProfiles(client: SupabaseClient) {
  const { data, error } = await client.from("profiles").select("*");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getCurrentProfile(client: SupabaseClient) {
  const userId = await getCurrentUserId(client);
  if (!userId) return null;
  return getProfileById(client, userId);
}
