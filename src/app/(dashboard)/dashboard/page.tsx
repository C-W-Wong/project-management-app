"use client";

import {
  FolderKanban,
  ClipboardCheck,
  Calendar,
  Users,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    title: "Active Projects",
    value: "12",
    icon: FolderKanban,
    change: "+2 this month",
  },
  {
    title: "Tasks Due Today",
    value: "8",
    icon: ClipboardCheck,
    change: "3 urgent",
  },
  {
    title: "Upcoming Meetings",
    value: "3",
    icon: Calendar,
    change: "Next in 2h",
  },
  {
    title: "Team Members",
    value: "24",
    icon: Users,
    change: "+3 this month",
  },
];

const projects = [
  { name: "Website Redesign", progress: 75, status: "In Progress" },
  { name: "Mobile App", progress: 45, status: "In Progress" },
  { name: "Marketing Campaign", progress: 90, status: "Review" },
  { name: "API Integration", progress: 30, status: "Planning" },
];

const deadlines = [
  {
    task: "Homepage wireframes",
    project: "Website Redesign",
    date: "Today",
    priority: "High",
  },
  {
    task: "User authentication flow",
    project: "Mobile App",
    date: "Tomorrow",
    priority: "Urgent",
  },
  {
    task: "Email campaign draft",
    project: "Marketing",
    date: "Feb 8",
    priority: "Medium",
  },
];

const meetings = [
  {
    title: "Design Review",
    description: "Review homepage mockups",
    time: "10:00 AM",
    attendees: ["A", "B", "C"],
  },
  {
    title: "Sprint Planning",
    description: "Plan next sprint tasks",
    time: "2:00 PM",
    attendees: ["D", "E"],
  },
  {
    title: "Client Call",
    description: "Weekly progress update",
    time: "4:30 PM",
    attendees: ["F", "G", "H", "I"],
  },
];

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
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Welcome back, Alex</h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stat Cards */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        {/* Left Column - Projects Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Projects Progress
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-0">
            {projects.map((project, i) => (
              <div
                key={project.name}
                className={`flex items-center gap-4 py-4 ${
                  i < projects.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>
            ))}
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
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.task}
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
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Upcoming Meetings
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-0">
              {meetings.map((meeting, i) => (
                <div
                  key={meeting.title}
                  className={`flex items-center gap-3 py-3 ${
                    i < meetings.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {meeting.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {meeting.attendees.map((a) => (
                        <Avatar
                          key={a}
                          className="h-6 w-6 border-2 border-background"
                        >
                          <AvatarFallback className="text-[10px]">
                            {a}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {meeting.time}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
