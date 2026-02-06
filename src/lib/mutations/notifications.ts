import type { SupabaseClient } from "@supabase/supabase-js";
import type { Notification } from "@/lib/queries/notifications";
import { getCurrentUserId } from "@/lib/queries/auth";

export async function createNotification(
  client: SupabaseClient,
  input: { title: string; body?: string | null }
) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");
  const { data, error } = await client
    .from("notifications")
    .insert({
      user_id: userId,
      title: input.title,
      body: input.body ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Notification;
}

export async function markNotificationRead(
  client: SupabaseClient,
  id: string
) {
  const { data, error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Notification;
}

export async function markAllNotificationsRead(client: SupabaseClient) {
  const { error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (error) throw error;
}
