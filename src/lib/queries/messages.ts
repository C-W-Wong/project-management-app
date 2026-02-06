import type { SupabaseClient } from "@supabase/supabase-js";

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export async function getMessagesForUser(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function getConversation(
  client: SupabaseClient,
  userId: string,
  otherUserId: string
) {
  const { data, error } = await client
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function getUnreadMessageCount(
  client: SupabaseClient,
  userId: string
) {
  const { count, error } = await client
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}
