"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientOnly } from "@/components/ui/client-only";
import { createClient } from "@/lib/supabase/client";
import { getProjects, getTasksForUser } from "@/lib/queries";
import { updateTaskStatus } from "@/lib/mutations";
import { formatDate, formatDateShort, getErrorMessage } from "@/lib/formatters";
import type { TaskWithAssignee } from "@/lib/queries/tasks";
import { TaskDetailModal } from "@/components/projects/task-detail-modal";

function statusColor(status: string) {
  switch (status) {
    case "To Do": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "In Progress": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "Review": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Done": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default: return "";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "Urgent": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "High": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "Medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    default: return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  }
}

export default function MyTasksPage() {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
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

  useEffect(() => {
    let active = true;
    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        const [tasksData, projectsData] = await Promise.all([
          getTasksForUser(supabase),
          getProjects(supabase),
        ]);
        const nameMap = projectsData.reduce<Record<string, string>>(
          (acc, project) => {
            acc[project.id] = project.name;
            return acc;
          },
          {}
        );
        if (active) {
          setProjectNames(nameMap);
          setTasks(tasksData);
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load tasks"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTasks();
    return () => {
      active = false;
    };
  }, [supabase]);

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  async function toggleComplete(id: string, checked: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: checked ? "Done" : "To Do" } : t
      )
    );
    try {
      await updateTaskStatus(supabase, id, checked ? "Done" : "To Do");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update task"));
    }
  }

  function openTaskDetail(task: TaskWithAssignee) {
    setSelectedTask({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.full_name ?? "Unassigned",
      dueDate: task.due_date ? formatDate(task.due_date) : "—",
      project: projectNames[task.project_id] ?? "Project",
      tags: [],
    });
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            All tasks assigned to you across projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ClientOnly
            fallback={
              <>
                <div className="h-9 w-[130px] rounded-md border bg-muted/30" />
                <div className="h-9 w-[130px] rounded-md border bg-muted/30" />
              </>
            }
          >
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]" aria-label="Filter by priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </ClientOnly>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Loading tasks...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No tasks found
          </p>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any tasks matching the selected filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]" />
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer"
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
                  <TableCell>
                    <Checkbox
                      checked={task.status === "Done"}
                      onCheckedChange={(checked) =>
                        toggleComplete(task.id, Boolean(checked))
                      }
                      onClick={(event) => event.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {projectNames[task.project_id] ?? "Project"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={priorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.due_date ? formatDateShort(task.due_date) : "--"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
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
