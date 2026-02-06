import type { SupabaseClient } from "@supabase/supabase-js";
import type { Meeting, MeetingAttendee } from "@/types/database";
import { getCurrentUserId } from "@/lib/queries/auth";

export type MeetingInput = {
  title: string;
  description?: string | null;
  date: string;
  time: string;
  duration?: string;
  project_id?: string | null;
  attendee_ids?: string[];
};

export async function createMeeting(client: SupabaseClient, input: MeetingInput) {
  const userId = await getCurrentUserId(client);
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await client
    .from("meetings")
    .insert({
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      time: input.time,
      duration: input.duration ?? "1 hour",
      project_id: input.project_id ?? null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;

  const attendeeIds = new Set(input.attendee_ids ?? []);
  attendeeIds.add(userId);

  const payload = Array.from(attendeeIds).map((profileId) => ({
    meeting_id: data.id,
    profile_id: profileId,
  }));

  const { error: attendeeError, data: attendeeData } = await client
    .from("meeting_attendees")
    .insert(payload)
    .select("*");
  if (attendeeError) throw attendeeError;

  return {
    meeting: data as Meeting,
    attendees: (attendeeData ?? []) as MeetingAttendee[],
  };
}
