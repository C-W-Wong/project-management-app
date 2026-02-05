"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineTask {
  id: string;
  title: string;
  startDay: number;
  endDay: number;
  color: string;
  category: string;
}

const tasks: TimelineTask[] = [
  { id: "1", title: "Design homepage mockup", startDay: 0, endDay: 3, color: "bg-blue-400", category: "Design" },
  { id: "2", title: "Set up authentication", startDay: 1, endDay: 4, color: "bg-orange-400", category: "Development" },
  { id: "3", title: "Create API endpoints", startDay: 2, endDay: 6, color: "bg-green-400", category: "Development" },
  { id: "4", title: "Database schema design", startDay: 0, endDay: 2, color: "bg-purple-400", category: "Architecture" },
  { id: "5", title: "Landing page copy", startDay: 3, endDay: 5, color: "bg-yellow-400", category: "Content" },
  { id: "6", title: "Logo design", startDay: 4, endDay: 6, color: "bg-pink-400", category: "Design" },
];

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TimelineView() {
  const [weekOffset, setWeekOffset] = useState(0);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1 + weekOffset * 7);

  const days = dayNames.map((name, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      name,
      date: d.getDate(),
      month: d.toLocaleString("default", { month: "short" }),
    };
  });

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((p) => p - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
          This Week
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((p) => p + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="ml-2 text-sm text-muted-foreground">
          {days[0].month} {days[0].date} - {days[6].month} {days[6].date}
        </span>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto rounded-lg border">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b bg-muted/50">
            <div className="p-3 text-sm font-medium text-muted-foreground">Task</div>
            {days.map((day) => (
              <div key={day.name + day.date} className="border-l p-3 text-center">
                <div className="text-xs text-muted-foreground">{day.name}</div>
                <div className="text-sm font-medium">{day.date}</div>
              </div>
            ))}
          </div>

          {/* Task Rows */}
          {tasks.map((task) => (
            <div key={task.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b last:border-0">
              <div className="flex items-center p-3">
                <span className="truncate text-sm">{task.title}</span>
              </div>
              <div className="relative col-span-7 flex items-center">
                <div
                  className={`absolute h-6 rounded ${task.color} opacity-80`}
                  style={{
                    left: `${(task.startDay / 7) * 100}%`,
                    width: `${((task.endDay - task.startDay + 1) / 7) * 100}%`,
                  }}
                />
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-full flex-1 border-l" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
