"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getTasksByProject } from "@/lib/queries";
import { formatDate, getErrorMessage } from "@/lib/formatters";
import type { TaskWithAssignee } from "@/lib/queries/tasks";
import { TaskDetailModal } from "@/components/projects/task-detail-modal";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface TimelineViewProps {
  projectId: string;
  projectName?: string | null;
  refreshKey?: number;
  statusFilter?: "all" | "To Do" | "In Progress" | "Review" | "Done";
}

export function TimelineView({
  projectId,
  projectName,
  refreshKey = 0,
  statusFilter = "all",
}: TimelineViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee: string;
    dueDate: string;
    project: string;
    tags: string[];
  } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;
    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTasksByProject(supabase, projectId);
        if (!active) return;
        setTasks(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load timeline"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTasks();
    return () => {
      active = false;
    };
  }, [projectId, refreshKey, supabase]);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1 + weekOffset * 7);

  const days = dayNames.map((name, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      name,
      date: d.getDate(),
      month: d.toLocaleString("default", { month: "short" }),
    };
  });

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  const visibleTasks = filteredTasks.filter((task) => task.due_date);

  function openTaskDetail(task: TaskWithAssignee) {
    setSelectedTask({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.full_name ?? "Unassigned",
      dueDate: task.due_date ? formatDate(task.due_date) : "—",
      project: projectName ?? "Project",
      tags: [],
    });
    setDetailOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((p) => p - 1)} aria-label="Previous week">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
          This Week
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((p) => p + 1)} aria-label="Next week">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="ml-2 text-sm text-muted-foreground">
          {days[0].month} {days[0].date} - {days[6].month} {days[6].date}
        </span>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto rounded-lg border">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b bg-muted/50">
            <div className="p-3 text-sm font-medium text-muted-foreground">Task</div>
            {days.map((day) => (
              <div key={day.name + day.date} className="border-l p-3 text-center">
                <div className="text-xs text-muted-foreground">{day.name}</div>
                <div className="text-sm font-medium">{day.date}</div>
              </div>
            ))}
          </div>

          {/* Task Rows */}
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading timeline...</div>
          ) : error ? (
            <div className="p-4 text-sm text-destructive">{error}</div>
          ) : visibleTasks.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No tasks scheduled.</div>
          ) : (
            visibleTasks.map((task, index) => {
              const due = new Date(task.due_date as string);
              const dayIndex = (due.getDay() + 6) % 7;
              const color = timelineColors[index % timelineColors.length];
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[200px_repeat(7,1fr)] border-b last:border-0 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => openTaskDetail(task)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openTaskDetail(task);
                    }
                  }}
                >
                  <div className="flex items-center p-3">
                    <span className="truncate text-sm">{task.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {task.status}
                    </span>
                  </div>
                  <div className="relative col-span-7 flex items-center">
                    <div
                      className={`absolute h-6 rounded ${color} opacity-80`}
                      style={{
                        left: `${(dayIndex / 7) * 100}%`,
                        width: `${(1 / 7) * 100}%`,
                      }}
                    />
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-full flex-1 border-l" />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <TaskDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask ?? undefined}
      />
    </div>
  );
}

const timelineColors = [
  "bg-blue-400",
  "bg-orange-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-yellow-400",
  "bg-pink-400",
];
