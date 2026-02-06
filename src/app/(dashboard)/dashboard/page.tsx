"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  ClipboardCheck,
  Calendar,
  Users,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { createClient } from "@/lib/supabase/client";
import { getAllProfiles, getCurrentProfile, getMeetings, getProjects } from "@/lib/queries";
import { formatDateShort, formatTime, getErrorMessage, getInitials } from "@/lib/formatters";
import type { MeetingWithAttendees } from "@/lib/queries/meetings";
import type { Project } from "@/types/database";

type DeadlineItem = {
  id: string;
  task: string;
  project: string;
  date: string;
  priority: string;
};

function priorityColor(priority: string) {
  switch (priority) {
    case "Urgent":
      return "bg-red-500";
    case "High":
      return "bg-orange-500";
    case "Medium":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [profileName, setProfileName] = useState("there");
  const [stats, setStats] = useState<
    { title: string; value: string; icon: typeof FolderKanban; change: string }[]
  >([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");

        const [profile, projectsData, meetingsData, profilesData, deadlinesData, tasksDueToday] =
          await Promise.all([
            getCurrentProfile(supabase),
            getProjects(supabase),
            getMeetings(supabase),
            getAllProfiles(supabase),
            supabase
              .from("tasks")
              .select("id, title, priority, due_date, project:projects(name)")
              .not("due_date", "is", null)
              .order("due_date", { ascending: true })
              .limit(4),
            supabase
              .from("tasks")
              .select("*", { count: "exact", head: true })
              .eq("due_date", todayStr),
          ]);

        if (!active) return;

        if (deadlinesData.error) throw deadlinesData.error;
        if (tasksDueToday.error) throw tasksDueToday.error;

        const upcomingMeetings = meetingsData.filter(
          (meeting) => meeting.date >= todayStr
        );

        const mappedDeadlines = (deadlinesData.data ?? []).map((row) => {
          const date = row.due_date as string | null;
          let label = date ? formatDateShort(date) : "";
          const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");
          if (date === todayStr) label = "Today";
          if (date === tomorrowStr) label = "Tomorrow";
          return {
            id: row.id as string,
            task: row.title as string,
            project: (row.project as { name?: string } | null)?.name ?? "Project",
            date: label,
            priority: row.priority as string,
          } satisfies DeadlineItem;
        });

        const activeProjects = projectsData.filter(
          (project) => project.status !== "Completed"
        ).length;

        const newStats = [
          {
            title: "Active Projects",
            value: String(activeProjects),
            icon: FolderKanban,
            change: `${activeProjects} active`,
          },
          {
            title: "Tasks Due Today",
            value: String(tasksDueToday.count ?? 0),
            icon: ClipboardCheck,
            change: "Due today",
          },
          {
            title: "Upcoming Meetings",
            value: String(upcomingMeetings.length),
            icon: Calendar,
            change: upcomingMeetings[0]
              ? `Next at ${formatTime(upcomingMeetings[0].time)}`
              : "No meetings",
          },
          {
            title: "Team Members",
            value: String(profilesData.length),
            icon: Users,
            change: `${profilesData.length} total`,
          },
        ];

        setProfileName(profile?.full_name ?? "there");
        setStats(newStats);
        setProjects(projectsData.slice(0, 4));
        setMeetings(upcomingMeetings.slice(0, 3));
        setDeadlines(mappedDeadlines);
      } catch (err) {
        const message = getErrorMessage(err, "Failed to load dashboard data");
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [supabase, refreshKey]);

  function handleProjectCreated() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Welcome back, {profileName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-4 h-8 w-16 rounded bg-muted" />
                <div className="mt-3 h-3 w-20 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {stat.title}
                  </span>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        {/* Left Column - Projects Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Projects Progress
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0">
            {projects.length === 0 && !loading ? (
              <p className="py-6 text-sm text-muted-foreground">
                No projects yet.
              </p>
            ) : (
              projects.map((project, i) => (
                <div
                  key={project.id}
                  className={`flex items-center gap-4 py-4 ${
                    i < projects.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {project.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Upcoming Deadlines
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tasks">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.length === 0 && !loading ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines.
                </p>
              ) : (
                deadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${priorityColor(
                        deadline.priority
                      )}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deadline.task}</p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.project}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {deadline.date}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Upcoming Meetings
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/meetings">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-0">
              {meetings.length === 0 && !loading ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No upcoming meetings.
                </p>
              ) : (
                meetings.map((meeting, i) => (
                  <div
                    key={meeting.id}
                    className={`flex items-center gap-3 py-3 ${
                      i < meetings.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{meeting.title}</p>
                      {meeting.description && (
                        <p className="text-xs text-muted-foreground">
                          {meeting.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {meeting.attendees.slice(0, 4).map((attendee) => (
                          <Avatar
                            key={attendee.id}
                            className="h-6 w-6 border-2 border-background"
                          >
                            {attendee.avatar_url && (
                              <AvatarImage src={attendee.avatar_url} />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {getInitials(attendee.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(meeting.time)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}
