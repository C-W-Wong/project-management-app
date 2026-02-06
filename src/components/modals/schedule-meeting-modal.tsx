"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createMeeting } from "@/lib/mutations";
import { getAllProfiles, getProjects } from "@/lib/queries";
import { getErrorMessage } from "@/lib/formatters";
import type { Profile, Project } from "@/types/database";

const meetingSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string(),
  project: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  description: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface ScheduleMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId?: string;
}

export function ScheduleMeetingModal({
  open,
  onClose,
  onSuccess,
  projectId,
}: ScheduleMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      duration: "1h",
      project: projectId,
      attendees: [],
    },
  });

  useEffect(() => {
    let active = true;
    async function loadOptions() {
      try {
        const [profilesData, projectsData] = await Promise.all([
          getAllProfiles(supabase),
          getProjects(supabase),
        ]);
        if (!active) return;
        setProfiles(profilesData);
        setProjects(projectsData);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load meeting options"));
      }
    }
    if (open) loadOptions();
    return () => {
      active = false;
    };
  }, [open, supabase]);

  function durationToInterval(value: string) {
    switch (value) {
      case "30m":
        return "30 minutes";
      case "45m":
        return "45 minutes";
      case "1.5h":
        return "90 minutes";
      case "2h":
        return "2 hours";
      default:
        return "1 hour";
    }
  }

  async function onSubmit(data: MeetingFormData) {
    setLoading(true);
    try {
      await createMeeting(supabase, {
        title: data.title,
        description: data.description ?? null,
        date: data.date,
        time: data.time,
        duration: durationToInterval(data.duration),
        project_id: data.project ?? projectId ?? null,
        attendee_ids: data.attendees ?? [],
      });
      toast.success("Meeting scheduled");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to schedule meeting"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="Enter meeting title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && (
                <p className="text-xs text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                defaultValue="1h"
                onValueChange={(v) => setValue("duration", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30m">30 minutes</SelectItem>
                  <SelectItem value="45m">45 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="1.5h">1.5 hours</SelectItem>
                  <SelectItem value="2h">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project (optional)</Label>
              <Select
                defaultValue={projectId}
                onValueChange={(v) => setValue("project", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No projects available
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attendees</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
              {profiles.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No team members found
                </p>
              ) : (
                profiles.map((profile) => (
                  <label
                    key={profile.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      onCheckedChange={(checked) => {
                        setValue(
                          "attendees",
                          checked
                            ? [...(getValues("attendees") ?? []), profile.id]
                            : (getValues("attendees") ?? []).filter(
                                (id) => id !== profile.id
                              )
                        );
                      }}
                    />
                    {profile.full_name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda or description..."
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
