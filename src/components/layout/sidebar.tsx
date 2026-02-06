"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  Bell,
  MessageCircle,
  Settings,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  getCurrentProfile,
  getCurrentUserId,
  getUnreadMessageCount,
  getUnreadNotificationCount,
} from "@/lib/queries";
import { getErrorMessage, getInitials } from "@/lib/formatters";
import type { Profile } from "@/types/database";

const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Meetings", href: "/meetings", icon: Calendar },
];

const teamNavItems = [
  { label: "Team Members", href: "/team", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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
        const [msgCount, notifCount] = await Promise.all([
          getUnreadMessageCount(supabase, resolvedUserId),
          getUnreadNotificationCount(supabase),
        ]);
        if (active) {
          setUnreadMessages(msgCount);
          setUnreadNotifications(notifCount);
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
      .channel(`sidebar-counts-${userId}`)
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-2",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-md p-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent">
            <span className="text-sm font-bold text-sidebar-foreground">P</span>
          </div>
          <span className="text-base font-semibold text-sidebar-foreground">
            ProjectHub
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5">
        <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Main
        </span>
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <span className="mt-4 px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Team
        </span>
        {teamNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.href === "/messages" && countsLoaded && unreadMessages > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                  {unreadMessages}
                </span>
              )}
              {item.href === "/notifications" && countsLoaded && unreadNotifications > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-md bg-sidebar p-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="text-xs">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              {profile?.full_name ?? "Loading..."}
            </span>
            <span className="text-xs text-muted-foreground">
              {profile?.role ?? "Team member"}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </aside>
  );
}
