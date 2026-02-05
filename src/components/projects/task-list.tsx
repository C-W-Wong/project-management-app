"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  size: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
}

const tasks: TaskItem[] = [
  {
    id: "t1",
    title: "Design homepage mockup",
    status: "To Do",
    priority: "High",
    size: "L",
    assignee: "AS",
    dueDate: "Feb 10",
    completed: false,
  },
  {
    id: "t2",
    title: "Set up authentication",
    status: "To Do",
    priority: "Urgent",
    size: "M",
    assignee: "JK",
    dueDate: "Feb 8",
    completed: false,
  },
  {
    id: "t3",
    title: "Create API endpoints",
    status: "In Progress",
    priority: "High",
    size: "XL",
    assignee: "ML",
    dueDate: "Feb 12",
    completed: false,
  },
  {
    id: "t4",
    title: "Database schema design",
    status: "In Progress",
    priority: "Medium",
    size: "M",
    assignee: "RD",
    dueDate: "Feb 11",
    completed: false,
  },
  {
    id: "t5",
    title: "Landing page copy",
    status: "Review",
    priority: "Low",
    size: "S",
    assignee: "TW",
    dueDate: "Feb 9",
    completed: false,
  },
  {
    id: "t6",
    title: "Logo design",
    status: "Done",
    priority: "Medium",
    size: "M",
    assignee: "SK",
    dueDate: "Feb 5",
    completed: true,
  },
];

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

export function TaskList() {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [taskList, setTaskList] = useState(tasks);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleComplete(id: string) {
    setTaskList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  const sorted = [...taskList].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
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
          {sorted.map((task) => (
            <TableRow key={task.id} className="cursor-pointer">
              <TableCell>
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleComplete(task.id)}
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
                <Badge variant="secondary" className={sizeColor(task.size)}>
                  {task.size}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {task.assignee}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.dueDate}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
