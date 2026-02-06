import type { SupabaseClient } from "@supabase/supabase-js";
import type { Meeting, Profile } from "@/types/database";
import { getProfilesByIds } from "./profiles";

export type MeetingWithAttendees = Meeting & {
  attendees: Profile[];
};

export async function getMeetings(client: SupabaseClient) {
  const { data, error } = await client
    .from("meetings")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) throw error;
  const meetings = (data ?? []) as Meeting[];
  return attachAttendees(client, meetings);
}

export async function getMeetingsByProject(
  client: SupabaseClient,
  projectId: string
) {
  const { data, error } = await client
    .from("meetings")
    .select("*")
    .eq("project_id", projectId)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) throw error;
  const meetings = (data ?? []) as Meeting[];
  return attachAttendees(client, meetings);
}

export async function getMeetingsByDate(
  client: SupabaseClient,
  date: string
) {
  const { data, error } = await client
    .from("meetings")
    .select("*")
    .eq("date", date)
    .order("time", { ascending: true });
  if (error) throw error;
  const meetings = (data ?? []) as Meeting[];
  return attachAttendees(client, meetings);
}

async function attachAttendees(client: SupabaseClient, meetings: Meeting[]) {
  if (meetings.length === 0) return [] as MeetingWithAttendees[];
  const meetingIds = meetings.map((meeting) => meeting.id);
  const { data: attendeesData, error: attendeesError } = await client
    .from("meeting_attendees")
    .select("meeting_id, profile_id")
    .in("meeting_id", meetingIds);
  if (attendeesError) throw attendeesError;
  const profileIds = Array.from(
    new Set((attendeesData ?? []).map((row) => row.profile_id).filter(Boolean))
  ) as string[];
  const profiles = await getProfilesByIds(client, profileIds);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const attendeesByMeeting = new Map<string, Profile[]>();
  for (const row of attendeesData ?? []) {
    const profile = profileMap.get(row.profile_id);
    if (!profile) continue;
    const list = attendeesByMeeting.get(row.meeting_id) ?? [];
    list.push(profile);
    attendeesByMeeting.set(row.meeting_id, list);
  }
  return meetings.map((meeting) => ({
    ...meeting,
    attendees: attendeesByMeeting.get(meeting.id) ?? [],
  })) as MeetingWithAttendees[];
}
