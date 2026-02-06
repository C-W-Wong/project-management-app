"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ClientOnly } from "@/components/ui/client-only";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { createClient } from "@/lib/supabase/client";
import { getProjectsWithMembers } from "@/lib/queries";
import { formatDate, getErrorMessage, getInitials } from "@/lib/formatters";
import type { ProjectSummary } from "@/lib/queries/projects";

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
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;
    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProjectsWithMembers(supabase);
        if (active) setProjects(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load projects"));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProjects();
    return () => {
      active = false;
    };
  }, [supabase, refreshKey]);

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
          <ClientOnly
            fallback={<div className="h-9 w-[150px] rounded-md border bg-muted/30" />}
          >
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
          </ClientOnly>
          <Button
            onClick={() => {
              setSelectedProject(null);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((project) => (
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
                    {project.due_date ? formatDate(project.due_date) : "--"}
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map((member) => (
                        <Avatar
                          key={member.id}
                          className="h-7 w-7 border-2 border-background"
                        >
                          {member.avatar_url && (
                            <AvatarImage src={member.avatar_url} />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Project settings"
                    onClick={() => {
                      setSelectedProject(project);
                      setModalOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
        project={
          selectedProject
            ? {
                id: selectedProject.id,
                name: selectedProject.name,
                description: selectedProject.description ?? "",
                status: selectedProject.status,
                dueDate: selectedProject.due_date ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}
