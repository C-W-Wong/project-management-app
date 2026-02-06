"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScheduleMeetingModal } from "@/components/modals/schedule-meeting-modal";
import { createClient } from "@/lib/supabase/client";
import { getMeetings } from "@/lib/queries";
import { formatTime, getErrorMessage, getInitials } from "@/lib/formatters";
import type { MeetingWithAttendees } from "@/lib/queries/meetings";

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
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = useMemo(() => createClient(), []);

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

  const meetingsByDate = meetings.reduce<Record<string, MeetingWithAttendees[]>>(
    (acc, meeting) => {
      const key = meeting.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(meeting);
      return acc;
    },
    {}
  );

  const selectedMeetings = meetingsByDate[selectedDate] ?? [];

  useEffect(() => {
    let active = true;
    async function loadMeetings() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMeetings(supabase);
        if (active) setMeetings(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load meetings"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMeetings();
    return () => {
      active = false;
    };
  }, [supabase, refreshKey]);

  function handleMeetingScheduled() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Meetings</h1>
          <p className="text-sm text-muted-foreground">
            Schedule and manage your team meetings
          </p>
        </div>
        <Button onClick={() => setScheduleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
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
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading meetings...
              </p>
            ) : selectedMeetings.length === 0 ? (
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
                    {i < selectedMeetings.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScheduleMeetingModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSuccess={handleMeetingScheduled}
      />
    </div>
  );
}
