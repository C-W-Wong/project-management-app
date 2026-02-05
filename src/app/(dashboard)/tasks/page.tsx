"use client";

import { useState } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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

interface MyTask {
  id: string;
  title: string;
  project: string;
  status: string;
  priority: string;
  dueDate: string;
  completed: boolean;
}

const myTasks: MyTask[] = [
  { id: "1", title: "Design homepage mockup", project: "Website Redesign", status: "To Do", priority: "High", dueDate: "Feb 10", completed: false },
  { id: "2", title: "Set up authentication", project: "Mobile App", status: "In Progress", priority: "Urgent", dueDate: "Feb 8", completed: false },
  { id: "3", title: "Create API endpoints", project: "Website Redesign", status: "In Progress", priority: "High", dueDate: "Feb 12", completed: false },
  { id: "4", title: "Write landing page copy", project: "Marketing Campaign", status: "Review", priority: "Medium", dueDate: "Feb 9", completed: false },
  { id: "5", title: "Design database schema", project: "API Integration", status: "Done", priority: "Medium", dueDate: "Feb 5", completed: true },
  { id: "6", title: "Fix login bug", project: "Mobile App", status: "To Do", priority: "Urgent", dueDate: "Feb 7", completed: false },
];

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
  const [tasks, setTasks] = useState(myTasks);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  function toggleComplete(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
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
        </div>
      </div>

      {filtered.length === 0 ? (
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
                <TableRow key={task.id} className="cursor-pointer">
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleComplete(task.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.project}
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
                    {task.dueDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
