"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientOnly } from "@/components/ui/client-only";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { TaskList } from "@/components/projects/task-list";
import { TimelineView } from "@/components/projects/timeline-view";
import { DocumentsView } from "@/components/projects/documents-view";
import { MeetingsView } from "@/components/projects/meetings-view";
import { ProgressView } from "@/components/projects/progress-view";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { createClient } from "@/lib/supabase/client";
import { getProjectById, getProjectMembers } from "@/lib/queries";
import { formatDate, getErrorMessage } from "@/lib/formatters";
import type { Project } from "@/types/database";

export default function ProjectDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("board");
  const [statusFilter, setStatusFilter] = useState("all");
  const [project, setProject] = useState<Project | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!projectId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Invalid project ID.
      </div>
    );
  }

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const [projectData, members] = await Promise.all([
          getProjectById(supabase, projectId),
          getProjectMembers(supabase, projectId),
        ]);
        if (!active) return;
        setProject(projectData);
        setMemberCount(members.length);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load project"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProject();
    return () => {
      active = false;
    };
  }, [projectId, refreshKey, supabase]);

  function handleTaskCreated() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project?.name ?? "Project" },
        ]}
      />

      {/* Project Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">
            {project?.name ?? "Project"}
          </h1>
          {project && (
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              {project.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {project?.due_date ? formatDate(project.due_date) : "--"}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {memberCount} members
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="board">Task Board</TabsTrigger>
            <TabsTrigger value="list">Task List</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <ClientOnly
            fallback={<div className="h-9 w-[160px] rounded-md border bg-muted/30" />}
          >
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]" aria-label="Filter tasks">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </ClientOnly>
          <Button size="sm" onClick={() => setTaskModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          Loading project...
        </div>
      )}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "board" && (
        <KanbanBoard
          projectId={projectId}
          projectName={project?.name}
          refreshKey={refreshKey}
          statusFilter={statusFilter}
          onTaskUpdated={handleTaskCreated}
        />
      )}
      {activeTab === "list" && (
        <TaskList
          projectId={projectId}
          projectName={project?.name}
          refreshKey={refreshKey}
          statusFilter={statusFilter}
          onTaskUpdated={handleTaskCreated}
        />
      )}
      {activeTab === "timeline" && (
        <TimelineView
          projectId={projectId}
          projectName={project?.name}
          refreshKey={refreshKey}
          statusFilter={statusFilter}
        />
      )}
      {activeTab === "documents" && (
        <DocumentsView
          projectId={projectId}
          refreshKey={refreshKey}
          onUploaded={handleTaskCreated}
        />
      )}
      {activeTab === "meetings" && (
        <MeetingsView
          projectId={projectId}
          refreshKey={refreshKey}
          onMeetingScheduled={handleTaskCreated}
        />
      )}
      {activeTab === "progress" && (
        <ProgressView projectId={projectId} refreshKey={refreshKey} />
      )}

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSuccess={handleTaskCreated}
        projectId={projectId}
      />
    </div>
  );
}
