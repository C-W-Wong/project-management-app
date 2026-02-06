"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { getTasksByProject } from "@/lib/queries";
import { getErrorMessage, getInitials, formatRelativeDate } from "@/lib/formatters";
import type { TaskWithAssignee } from "@/lib/queries/tasks";

interface ProgressViewProps {
  projectId: string;
  refreshKey?: number;
}

export function ProgressView({ projectId, refreshKey = 0 }: ProgressViewProps) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTasksByProject(supabase, projectId);
        if (active) setTasks(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load progress"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTasks();
    return () => {
      active = false;
    };
  }, [projectId, refreshKey, supabase]);

  const statusData = [
    { name: "To Do", value: tasks.filter((t) => t.status === "To Do").length, color: "#3B82F6" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "In Progress").length, color: "#F59E0B" },
    { name: "Review", value: tasks.filter((t) => t.status === "Review").length, color: "#8B5CF6" },
    { name: "Done", value: tasks.filter((t) => t.status === "Done").length, color: "#10B981" },
  ];

  const totalTasks = statusData.reduce((sum, s) => sum + s.value, 0);
  const completedTasks = statusData.find((s) => s.name === "Done")?.value ?? 0;
  const progressPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activities = tasks
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      user: task.assignee?.full_name ?? "Someone",
      action: `updated task '${task.title}'`,
      timestamp: formatRelativeDate(task.created_at),
      avatar: task.assignee?.avatar_url ?? null,
    }));

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={progressPercent} className="h-3 flex-1" />
            <span className="text-2xl font-bold">{progressPercent}%</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">
                {statusData.find((s) => s.name === "In Progress")?.value ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">
                {statusData.find((s) => s.name === "To Do")?.value ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">To Do</p>
            </div>
          </div>
          {loading && (
            <p className="text-sm text-muted-foreground">Loading progress...</p>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Task Progress by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Task Progress by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    {activity.avatar && (
                      <AvatarImage src={activity.avatar} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
