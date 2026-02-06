"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getTasksByProject } from "@/lib/queries";
import { updateTaskStatus } from "@/lib/mutations";
import { formatDate, formatDateShort, getErrorMessage, getInitials } from "@/lib/formatters";
import type { TaskWithAssignee } from "@/lib/queries/tasks";
import { TaskDetailModal } from "@/components/projects/task-detail-modal";

function statusColor(status: string) {
  switch (status) {
    case "To Do":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "In Progress":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "Review":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Done":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default:
      return "";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "Urgent":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "High":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  }
}

function sizeColor(size: string) {
  switch (size) {
    case "XL":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    case "L":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "M":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  }
}

type SortKey = "title" | "status" | "priority" | "dueDate";

interface TaskListProps {
  projectId: string;
  projectName?: string | null;
  refreshKey?: number;
  statusFilter?: "all" | "To Do" | "In Progress" | "Review" | "Done";
  onTaskUpdated?: () => void;
}

export function TaskList({
  projectId,
  projectName,
  refreshKey = 0,
  statusFilter = "all",
  onTaskUpdated,
}: TaskListProps) {
  const supabase = useMemo(() => createClient(), []);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [taskList, setTaskList] = useState<TaskWithAssignee[]>([]);
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

  useEffect(() => {
    let active = true;
    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTasksByProject(supabase, projectId);
        if (active) setTaskList(data);
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
  }, [projectId, refreshKey, supabase]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function toggleComplete(id: string, checked: boolean) {
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: checked ? "Done" : "To Do" } : t
      )
    );
    try {
      await updateTaskStatus(supabase, id, checked ? "Done" : "To Do");
      onTaskUpdated?.();
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
      project: projectName ?? "Project",
      tags: [],
    });
    setDetailOpen(true);
  }

  const filteredTasks =
    statusFilter === "all"
      ? taskList
      : taskList.filter((task) => task.status === statusFilter);

  const sorted = [...filteredTasks].sort((a, b) => {
    const aVal =
      sortKey === "dueDate" ? a.due_date ?? "" : (a as TaskWithAssignee)[sortKey];
    const bVal =
      sortKey === "dueDate" ? b.due_date ?? "" : (b as TaskWithAssignee)[sortKey];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => handleSort("title")}
              >
                Task
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => handleSort("status")}
              >
                Status
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => handleSort("priority")}
              >
                Priority
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => handleSort("dueDate")}
              >
                Due Date
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                Loading tasks...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-destructive">
                {error}
              </TableCell>
            </TableRow>
          ) : sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                No tasks found.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((task) => (
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
                <TableCell>
                  <Badge variant="secondary" className={statusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={priorityColor(task.priority)}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={sizeColor(task.size ?? "M")}>
                    {task.size ?? "M"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {task.assignee?.avatar_url && (
                        <AvatarImage src={task.assignee.avatar_url} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(task.assignee?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {task.due_date ? formatDateShort(task.due_date) : "--"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
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
