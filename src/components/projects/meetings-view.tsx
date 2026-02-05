"use client";

import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface MeetingItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
}

const meetings: MeetingItem[] = [
  {
    id: "m1",
    title: "Design Review Meeting",
    description: "Review the latest design iterations for the homepage",
    date: "Feb 6, 2026",
    time: "10:00 AM",
    duration: "1h",
    attendees: ["AS", "JK", "ML"],
  },
  {
    id: "m2",
    title: "Sprint Planning",
    description: "Plan tasks and priorities for the upcoming sprint",
    date: "Feb 6, 2026",
    time: "2:00 PM",
    duration: "1.5h",
    attendees: ["RD", "TW", "SK", "AS"],
  },
  {
    id: "m3",
    title: "Client Feedback Session",
    description: "Present progress and gather client feedback on deliverables",
    date: "Feb 7, 2026",
    time: "11:00 AM",
    duration: "45m",
    attendees: ["AS", "ML"],
  },
  {
    id: "m4",
    title: "Backend Architecture Review",
    description: "Discuss API design patterns and database optimization",
    date: "Feb 8, 2026",
    time: "3:00 PM",
    duration: "1h",
    attendees: ["JK", "RD", "TW"],
  },
];

export function MeetingsView() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Project Meetings</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Meeting List */}
      <div className="space-y-0 rounded-lg border">
        {meetings.map((meeting, i) => (
          <div key={meeting.id}>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
              {/* Time */}
              <div className="w-20 text-center">
                <p className="text-sm font-medium">{meeting.time}</p>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="secondary" className="text-[10px]">
                    {meeting.duration}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <p className="text-sm font-medium">{meeting.title}</p>
                <p className="text-xs text-muted-foreground">
                  {meeting.description}
                </p>
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {meeting.attendees.map((a) => (
                    <Avatar
                      key={a}
                      className="h-6 w-6 border-2 border-background"
                    >
                      <AvatarFallback className="text-[10px]">{a}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {meeting.date}
                </span>
              </div>
            </div>
            {i < meetings.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
}
