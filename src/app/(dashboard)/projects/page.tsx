"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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

const projects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Redesigning the company website with modern UI",
    status: "In Progress" as const,
    progress: 75,
    dueDate: "Mar 15, 2026",
    team: ["AS", "JK", "ML"],
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Building cross-platform mobile application",
    status: "In Progress" as const,
    progress: 45,
    dueDate: "Apr 30, 2026",
    team: ["RD", "TW"],
  },
  {
    id: "3",
    name: "Marketing Campaign",
    description: "Q1 digital marketing strategy and execution",
    status: "Review" as const,
    progress: 90,
    dueDate: "Feb 28, 2026",
    team: ["SK", "LP", "MN"],
  },
  {
    id: "4",
    name: "API Integration",
    description: "Third-party API integration for payment processing",
    status: "Planning" as const,
    progress: 30,
    dueDate: "May 20, 2026",
    team: ["JD", "AK", "RS", "BT"],
  },
];

function statusVariant(status: string) {
  switch (status) {
    case "In Progress":
      return "default" as const;
    case "Review":
      return "secondary" as const;
    case "Completed":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "In Progress":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "Review":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Completed":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
  }
}

export default function ProjectsListPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all"
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">All Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your team projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" aria-label="Filter by status">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.id} className="cursor-pointer">
                <TableCell>
                  <Link
                    href={`/projects/${project.id}`}
                    className="block"
                  >
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.description}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(project.status)}
                    className={statusColor(project.status)}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={project.progress}
                      className="h-2 w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {project.dueDate}
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {project.team.map((member) => (
                      <Avatar
                        key={member}
                        className="h-7 w-7 border-2 border-background"
                      >
                        <AvatarFallback className="text-[10px]">
                          {member}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Project settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
