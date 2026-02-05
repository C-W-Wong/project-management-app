"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Tag } from "lucide-react";

type TaskStatus = "To Do" | "In Progress" | "Review" | "Done";

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  dueDate: string;
  assignee: string;
  tags: number;
}

const initialTasks: KanbanTask[] = [
  {
    id: "t1",
    title: "Design homepage mockup",
    description: "Create wireframes and visual design for the homepage",
    status: "To Do",
    priority: "High",
    dueDate: "Feb 10",
    assignee: "AS",
    tags: 2,
  },
  {
    id: "t2",
    title: "Set up authentication",
    description: "Implement login and signup with Supabase",
    status: "To Do",
    priority: "Urgent",
    dueDate: "Feb 8",
    assignee: "JK",
    tags: 1,
  },
  {
    id: "t3",
    title: "Create API endpoints",
    description: "Build REST API for project management",
    status: "In Progress",
    priority: "High",
    dueDate: "Feb 12",
    assignee: "ML",
    tags: 3,
  },
  {
    id: "t4",
    title: "Database schema design",
    description: "Design and implement database tables",
    status: "In Progress",
    priority: "Medium",
    dueDate: "Feb 11",
    assignee: "RD",
    tags: 1,
  },
  {
    id: "t5",
    title: "Landing page copy",
    description: "Write marketing copy for the landing page",
    status: "Review",
    priority: "Low",
    dueDate: "Feb 9",
    assignee: "TW",
    tags: 2,
  },
  {
    id: "t6",
    title: "Logo design",
    description: "Create brand logo and icon variations",
    status: "Done",
    priority: "Medium",
    dueDate: "Feb 5",
    assignee: "SK",
    tags: 1,
  },
];

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

export function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
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
                    {columnTasks.map((task, index) => (
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
                          >
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">
                                {task.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
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
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {task.dueDate}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {task.tags > 0 && (
                                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                      <Tag className="h-3 w-3" />
                                      {task.tags}
                                    </span>
                                  )}
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px]">
                                      {task.assignee}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
