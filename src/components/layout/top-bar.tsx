"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GlobalSearch } from "@/components/search/global-search";
import { createClient } from "@/lib/supabase/client";
import {
  getCurrentProfile,
  getCurrentUserId,
  getUnreadMessageCount,
  getUnreadNotificationCount,
} from "@/lib/queries";
import { getInitials, getErrorMessage } from "@/lib/formatters";
import type { Profile } from "@/types/database";

export function TopBar() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const data = await getCurrentProfile(supabase);
        if (active) setProfile(data);
      } catch (err) {
        console.warn(getErrorMessage(err, "Failed to load profile"));
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;
    async function loadCounts() {
      try {
        const resolvedUserId = await getCurrentUserId(supabase);
        if (!resolvedUserId) return;
        setUserId(resolvedUserId);
        const [notifCount, msgCount] = await Promise.all([
          getUnreadNotificationCount(supabase),
          getUnreadMessageCount(supabase, resolvedUserId),
        ]);
        if (active) {
          setUnreadNotifications(notifCount);
          setUnreadMessages(msgCount);
          setCountsLoaded(true);
        }
      } catch (err) {
        console.warn(getErrorMessage(err, "Failed to load counts"));
      }
    }
    loadCounts();
    interval = setInterval(loadCounts, 30000);
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`counts-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          getUnreadNotificationCount(supabase)
            .then(setUnreadNotifications)
            .catch(() => null);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          getUnreadMessageCount(supabase, userId)
            .then(setUnreadMessages)
            .catch(() => null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      {/* Search */}
      <GlobalSearch />
      <div className="sm:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Messages"
        >
          <Link href="/messages">
            <MessageCircle className="h-4 w-4" />
            {countsLoaded && unreadMessages > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Notifications"
        >
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
            {countsLoaded && unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </Link>
        </Button>
        <Avatar className="h-8 w-8">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
          <AvatarFallback className="text-xs">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
