import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message } from "@/lib/queries/messages";
import { getCurrentUserId } from "@/lib/queries/auth";

export async function sendMessage(
  client: SupabaseClient,
  input: { recipient_id: string; body: string }
) {
  const senderId = await getCurrentUserId(client);
  if (!senderId) throw new Error("User not authenticated");
  const { data, error } = await client
    .from("messages")
    .insert({
      sender_id: senderId,
      recipient_id: input.recipient_id,
      body: input.body,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Message;
}

export async function markMessageRead(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Message;
}

export async function markConversationRead(
  client: SupabaseClient,
  input: { recipient_id: string; sender_id: string }
) {
  const { error } = await client
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", input.recipient_id)
    .eq("sender_id", input.sender_id)
    .is("read_at", null);
  if (error) throw error;
}
