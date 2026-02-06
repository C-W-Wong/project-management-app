"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getNotifications } from "@/lib/queries";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/mutations";
import { formatRelativeDate, getErrorMessage } from "@/lib/formatters";
import type { Notification } from "@/lib/queries/notifications";

export default function NotificationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;
    async function loadNotifications() {
      if (initialLoad) setLoading(true);
      setError(null);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUserId(userData.user?.id ?? null);
        const data = await getNotifications(supabase);
        if (active) setNotifications(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load notifications"));
      } finally {
        if (active) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    }
    loadNotifications();
    interval = setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [supabase, initialLoad]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const next = payload.new as Notification;
            setNotifications((prev) => [next, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const next = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === next.id ? next : n))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead(supabase);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to mark all as read"));
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      const updated = await markNotificationRead(supabase, notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to mark as read"));
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Activity updates across your projects
          </p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead}>
          Mark all read
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading notifications...
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">All caught up</p>
                <p className="text-xs text-muted-foreground">
                  You don&apos;t have any new notifications.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{notification.title}</p>
                  {notification.body && (
                    <p className="text-xs text-muted-foreground">{notification.body}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeDate(notification.created_at)}
                  </p>
                </div>
                {notification.read_at ? (
                  <span className="text-xs text-muted-foreground">Read</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
