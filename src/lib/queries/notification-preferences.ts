import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationPreferences = {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  meeting_reminders: boolean;
  updated_at: string;
};

export async function getNotificationPreferences(
  client: SupabaseClient,
  userId: string
) {
  const { data, error } = await client
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data ?? null) as NotificationPreferences | null;
}
