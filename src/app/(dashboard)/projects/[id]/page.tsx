"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Filter, Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { TaskList } from "@/components/projects/task-list";
import { TimelineView } from "@/components/projects/timeline-view";
import { DocumentsView } from "@/components/projects/documents-view";
import { MeetingsView } from "@/components/projects/meetings-view";
import { ProgressView } from "@/components/projects/progress-view";

const projectData = {
  id: "1",
  name: "Website Redesign",
  status: "In Progress",
  dueDate: "Mar 15, 2026",
  memberCount: 8,
};

export default function ProjectDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("board");

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: projectData.name },
        ]}
      />

      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{projectData.name}</h1>
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
            {projectData.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {projectData.dueDate}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {projectData.memberCount} members
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="board">Task Board</TabsTrigger>
            <TabsTrigger value="list">Task List</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "board" && <KanbanBoard />}
      {activeTab === "list" && <TaskList />}
      {activeTab === "timeline" && <TimelineView />}
      {activeTab === "documents" && <DocumentsView />}
      {activeTab === "meetings" && <MeetingsView />}
      {activeTab === "progress" && <ProgressView />}
    </div>
  );
}
