"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const meetingsByDate: Record<
  string,
  { id: string; title: string; description: string; time: string; attendees: string[] }[]
> = {
  "2026-02-05": [
    { id: "1", title: "Design Review", description: "Review homepage mockups", time: "10:00 AM", attendees: ["AS", "JK", "ML"] },
    { id: "2", title: "Sprint Planning", description: "Plan next sprint tasks", time: "2:00 PM", attendees: ["RD", "TW", "SK"] },
    { id: "3", title: "Client Call", description: "Weekly progress update", time: "4:30 PM", attendees: ["AS", "ML"] },
  ],
  "2026-02-06": [
    { id: "4", title: "Team Standup", description: "Daily status update", time: "9:00 AM", attendees: ["AS", "JK", "ML", "RD"] },
  ],
  "2026-02-10": [
    { id: "5", title: "Product Demo", description: "Demo new features to stakeholders", time: "11:00 AM", attendees: ["AS", "TW"] },
  ],
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function MeetingsPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function goToToday() {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today.toISOString().split("T")[0]);
  }

  const selectedMeetings = meetingsByDate[selectedDate] ?? [];

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Meetings</h1>
          <p className="text-sm text-muted-foreground">
            Schedule and manage your team meetings
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === today.toISOString().split("T")[0];
                const hasMeetings = !!meetingsByDate[dateStr];

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative flex h-10 items-center justify-center rounded-md text-sm transition-colors
                      ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                      ${isToday && !isSelected ? "font-bold" : ""}
                    `}
                  >
                    {day}
                    {hasMeetings && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate === today.toISOString().split("T")[0]
                ? "Today's Meetings"
                : `Meetings on ${selectedDate}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMeetings.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No meetings scheduled for this day
              </p>
            ) : (
              <div className="space-y-0">
                {selectedMeetings.map((meeting, i) => (
                  <div key={meeting.id}>
                    <div className="flex items-center gap-3 py-3">
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
                    {i < selectedMeetings.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
