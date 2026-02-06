"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserId, getConversation, getProfileById } from "@/lib/queries";
import { markConversationRead, sendMessage } from "@/lib/mutations";
import { formatRelativeDate, getErrorMessage, getInitials } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@/lib/queries/messages";
import type { Profile } from "@/types/database";

export default function MessageThreadPage() {
  const params = useParams();
  const otherId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const messageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!otherId) return;
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;
    async function loadThread() {
      if (initialLoad) setLoading(true);
      setError(null);
      try {
        const currentUserId = await getCurrentUserId(supabase);
        if (!currentUserId) throw new Error("User not authenticated");
        const [thread, otherProfile] = await Promise.all([
          getConversation(supabase, currentUserId, otherId),
          getProfileById(supabase, otherId),
        ]);
        await markConversationRead(supabase, {
          recipient_id: currentUserId,
          sender_id: otherId,
        });
        if (active) {
          setUserId(currentUserId);
          const nextMessages = thread.map((msg) => {
            if (
              msg.sender_id === otherId &&
              msg.recipient_id === currentUserId
            ) {
              return { ...msg, read_at: msg.read_at ?? new Date().toISOString() };
            }
            return msg;
          });
          setMessages(nextMessages);
          setProfile(otherProfile);
          messageIdsRef.current = new Set(nextMessages.map((m) => m.id));
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load conversation"));
      } finally {
        if (active) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    }
    loadThread();
    interval = setInterval(loadThread, 30000);
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [otherId, supabase, initialLoad]);

  useEffect(() => {
    if (!userId || !otherId) return;
    const channelIncoming = supabase
      .channel(`thread-in-${userId}-${otherId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          if (
            (next.sender_id === otherId || next.recipient_id === otherId) &&
            !messageIdsRef.current.has(next.id)
          ) {
            messageIdsRef.current.add(next.id);
            setMessages((prev) => [...prev, next]);
          }
        }
      )
      .subscribe();

    const channelOutgoing = supabase
      .channel(`thread-out-${userId}-${otherId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          if (
            (next.sender_id === otherId || next.recipient_id === otherId) &&
            !messageIdsRef.current.has(next.id)
          ) {
            messageIdsRef.current.add(next.id);
            setMessages((prev) => [...prev, next]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelIncoming);
      supabase.removeChannel(channelOutgoing);
    };
  }, [supabase, userId, otherId]);

  async function handleSend() {
    if (!otherId || !input.trim()) return;
    try {
      const newMessage = await sendMessage(supabase, {
        recipient_id: otherId,
        body: input.trim(),
      });
      messageIdsRef.current.add(newMessage.id);
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send message"));
    }
  }

  if (!otherId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Invalid thread.</div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading conversation...
          </CardContent>
        </Card>
      ) : error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Avatar>
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {profile?.full_name ?? "Team member"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {profile?.role ?? "Team"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No messages yet.
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === userId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[70%] rounded-lg border bg-muted px-3 py-2 text-sm">
                      <p>{message.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatRelativeDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
