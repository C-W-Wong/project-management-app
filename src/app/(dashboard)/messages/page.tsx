"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserId, getMessagesForUser, getProfilesByIds } from "@/lib/queries";
import { formatRelativeDate, getErrorMessage, getInitials } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/lib/queries/messages";
import type { Profile } from "@/types/database";

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;
    async function loadMessages() {
      if (initialLoad) setLoading(true);
      setError(null);
      try {
        const userId = await getCurrentUserId(supabase);
        if (!userId) throw new Error("User not authenticated");
        setCurrentUserId(userId);
        const data = await getMessagesForUser(supabase, userId);
        const otherIds = Array.from(
          new Set(
            data.map((msg) =>
              msg.sender_id === userId ? msg.recipient_id : msg.sender_id
            )
          )
        );
        const profilesData = await getProfilesByIds(supabase, otherIds);
        const profileMap = profilesData.reduce<Record<string, Profile>>((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
        if (active) {
          setMessages(data);
          setProfiles(profileMap);
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load messages"));
      } finally {
        if (active) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    }
    loadMessages();
    interval = setInterval(loadMessages, 30000);
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [supabase, initialLoad]);

  useEffect(() => {
    if (!currentUserId) return;
    const channelIncoming = supabase
      .channel(`messages-in-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          setMessages((prev) => [next, ...prev]);
        }
      )
      .subscribe();

    const channelOutgoing = supabase
      .channel(`messages-out-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${currentUserId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          setMessages((prev) => [next, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelIncoming);
      supabase.removeChannel(channelOutgoing);
    };
  }, [supabase, currentUserId]);

  const latestByUser = new Map<string, Message>();
  const unreadByUser = new Map<string, number>();
  if (currentUserId) {
    for (const msg of messages) {
      const otherId =
        msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id;
      if (!latestByUser.has(otherId)) latestByUser.set(otherId, msg);
      if (msg.recipient_id === currentUserId && !msg.read_at) {
        unreadByUser.set(otherId, (unreadByUser.get(otherId) ?? 0) + 1);
      }
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Conversations with your team
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading conversations...
          </CardContent>
        </Card>
      ) : latestByUser.size === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No messages yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {Array.from(latestByUser.entries()).map(([otherId, message]) => {
            const profile = profiles[otherId];
            return (
              <Link key={otherId} href={`/messages/${otherId}`}>
                <Card className="transition-colors hover:bg-muted">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar>
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} />
                      )}
                      <AvatarFallback>
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {profile?.full_name ?? "Team member"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {message.body}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                      <span>{formatRelativeDate(message.created_at)}</span>
                      {unreadByUser.get(otherId) ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                          {unreadByUser.get(otherId)}
                        </span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
