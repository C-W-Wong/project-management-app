"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { getMeetingsByProject } from "@/lib/queries";
import { formatDate, formatTime, getErrorMessage, getInitials } from "@/lib/formatters";
import type { MeetingWithAttendees } from "@/lib/queries/meetings";
import { ScheduleMeetingModal } from "@/components/modals/schedule-meeting-modal";

interface MeetingsViewProps {
  projectId: string;
  refreshKey?: number;
  onMeetingScheduled?: () => void;
}

export function MeetingsView({
  projectId,
  refreshKey = 0,
  onMeetingScheduled,
}: MeetingsViewProps) {
  const supabase = useMemo(() => createClient(), []);
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadMeetings() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMeetingsByProject(supabase, projectId);
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
  }, [projectId, refreshKey, supabase]);

  function handleMeetingScheduled() {
    onMeetingScheduled?.();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Project Meetings</h3>
        <Button onClick={() => setScheduleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Meeting List */}
      <div className="space-y-0 rounded-lg border">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading meetings...</div>
        ) : error ? (
          <div className="p-4 text-sm text-destructive">{error}</div>
        ) : meetings.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No meetings scheduled.
          </div>
        ) : (
          meetings.map((meeting, i) => (
            <div key={meeting.id}>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                {/* Time */}
                <div className="w-20 text-center">
                  <p className="text-sm font-medium">{formatTime(meeting.time)}</p>
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
                  {meeting.description && (
                    <p className="text-xs text-muted-foreground">
                      {meeting.description}
                    </p>
                  )}
                </div>

                {/* Attendees */}
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
                    {formatDate(meeting.date)}
                  </span>
                </div>
              </div>
              {i < meetings.length - 1 && <Separator />}
            </div>
          ))
        )}
      </div>

      <ScheduleMeetingModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSuccess={handleMeetingScheduled}
        projectId={projectId}
      />
    </div>
  );
}
