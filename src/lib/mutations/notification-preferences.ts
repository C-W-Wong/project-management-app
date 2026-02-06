import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationPreferences } from "@/lib/queries/notification-preferences";
import { getCurrentUserId } from "@/lib/queries/auth";

export async function upsertNotificationPreferences(
  client: SupabaseClient,
  input: {
    email_enabled: boolean;
    push_enabled: boolean;
    meeting_reminders: boolean;
  }
) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");
  const { data, error } = await client
    .from("notification_preferences")
    .upsert({
      user_id: userId,
      email_enabled: input.email_enabled,
      push_enabled: input.push_enabled,
      meeting_reminders: input.meeting_reminders,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as NotificationPreferences;
}
