"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const statusData = [
  { name: "To Do", value: 8, color: "#3B82F6" },
  { name: "In Progress", value: 5, color: "#F59E0B" },
  { name: "Review", value: 3, color: "#8B5CF6" },
  { name: "Done", value: 12, color: "#10B981" },
];

const activities = [
  {
    id: "a1",
    user: "AS",
    action: "completed task 'Logo design'",
    timestamp: "2 hours ago",
  },
  {
    id: "a2",
    user: "JK",
    action: "added a comment on 'Homepage mockup'",
    timestamp: "3 hours ago",
  },
  {
    id: "a3",
    user: "ML",
    action: "moved 'Create API endpoints' to In Progress",
    timestamp: "5 hours ago",
  },
  {
    id: "a4",
    user: "RD",
    action: "created task 'Database schema design'",
    timestamp: "Yesterday",
  },
  {
    id: "a5",
    user: "TW",
    action: "uploaded 'Brand Guidelines.pdf'",
    timestamp: "Yesterday",
  },
];

const totalTasks = statusData.reduce((sum, s) => sum + s.value, 0);
const completedTasks = statusData.find((s) => s.name === "Done")?.value ?? 0;
const progressPercent = Math.round((completedTasks / totalTasks) * 100);

export function ProgressView() {
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={progressPercent} className="h-3 flex-1" />
            <span className="text-2xl font-bold">{progressPercent}%</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">
                {statusData.find((s) => s.name === "In Progress")?.value ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold">
                {statusData.find((s) => s.name === "To Do")?.value ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">To Do</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Task Progress by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Task Progress by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {activity.user}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
