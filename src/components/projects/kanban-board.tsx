"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTasksByProject } from "@/lib/queries";
import { updateTaskStatus } from "@/lib/mutations";
import { formatDate, formatDateShort, getErrorMessage, getInitials } from "@/lib/formatters";
import type { TaskWithAssignee } from "@/lib/queries/tasks";
import { toast } from "sonner";
import { TaskDetailModal } from "@/components/projects/task-detail-modal";

type TaskStatus = "To Do" | "In Progress" | "Review" | "Done";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Review", title: "Review" },
  { id: "Done", title: "Done" },
];

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

interface KanbanBoardProps {
  projectId: string;
  projectName?: string | null;
  refreshKey?: number;
  statusFilter?: TaskStatus | "all";
  onTaskUpdated?: () => void;
}

export function KanbanBoard({
  projectId,
  projectName,
  refreshKey = 0,
  statusFilter = "all",
  onTaskUpdated,
}: KanbanBoardProps) {
  const supabase = useMemo(() => createClient(), []);
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

  useEffect(() => {
    let active = true;
    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTasksByProject(supabase, projectId);
        if (active) setTasks(data);
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

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    try {
      await updateTaskStatus(supabase, taskId, newStatus, result.destination.index);
      onTaskUpdated?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update task"));
      // Re-fetch to restore accurate state
      setLoading(true);
      try {
        const data = await getTasksByProject(supabase, projectId);
        setTasks(data);
      } finally {
        setLoading(false);
      }
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const visibleTasks =
            statusFilter === "all"
              ? tasks
              : tasks.filter((t) => t.status === statusFilter);
          const columnTasks = visibleTasks.filter((t) => t.status === column.id);
          return (
            <div
              key={column.id}
              className="flex w-72 min-w-[288px] flex-col rounded-lg bg-muted/50"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{column.title}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex min-h-[200px] flex-col gap-2 px-2 pb-2"
                  >
                    {loading ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        Loading tasks...
                      </div>
                    ) : error ? (
                      <div className="p-3 text-sm text-destructive">{error}</div>
                    ) : columnTasks.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        No tasks
                      </div>
                    ) : (
                      columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
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
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between pt-1">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className={`text-[10px] ${priorityColor(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                    {task.due_date && (
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {formatDateShort(task.due_date)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                    <Avatar className="h-6 w-6">
                                      {task.assignee?.avatar_url && (
                                        <AvatarImage src={task.assignee.avatar_url} />
                                      )}
                                      <AvatarFallback className="text-[10px]">
                                        {getInitials(task.assignee?.full_name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
      <TaskDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask ?? undefined}
      />
    </DragDropContext>
  );
}
