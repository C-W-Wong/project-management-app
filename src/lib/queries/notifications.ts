import type { SupabaseClient } from "@supabase/supabase-js";

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export async function getNotifications(client: SupabaseClient) {
  const { data, error } = await client
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function getUnreadNotificationCount(client: SupabaseClient) {
  const { count, error } = await client
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}
