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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createTask, updateTask } from "@/lib/mutations";
import { getAllProfiles } from "@/lib/queries";
import { getErrorMessage } from "@/lib/formatters";
import type { Profile } from "@/types/database";

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId?: string;
  task?: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee: string;
    dueDate: string;
  };
}

export function CreateTaskModal({
  open,
  onClose,
  onSuccess,
  projectId,
  task,
}: CreateTaskModalProps) {
  const isEdit = !!task;
  const [loading, setLoading] = useState(false);
  const [assignees, setAssignees] = useState<Profile[]>([]);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee,
          dueDate: task.dueDate,
        }
      : {
          status: "To Do",
          priority: "Medium",
        },
  });

  useEffect(() => {
    let active = true;
    async function loadAssignees() {
      try {
        const profiles = await getAllProfiles(supabase);
        if (active) setAssignees(profiles);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load assignees"));
      }
    }
    if (open) loadAssignees();
    return () => {
      active = false;
    };
  }, [open, supabase]);

  async function onSubmit(data: TaskFormData) {
    setLoading(true);
    try {
      if (isEdit && task) {
        await updateTask(supabase, task.id, {
          title: data.title,
          description: data.description ?? null,
          status: data.status as "To Do" | "In Progress" | "Review" | "Done",
          priority: data.priority as "Low" | "Medium" | "High" | "Urgent",
          assignee_id: data.assignee || null,
          due_date: data.dueDate ?? null,
        });
        toast.success("Task updated");
      } else {
        if (!projectId) throw new Error("Project is required");
        await createTask(supabase, {
          title: data.title,
          description: data.description ?? null,
          status: data.status as "To Do" | "In Progress" | "Review" | "Done",
          priority: data.priority as "Low" | "Medium" | "High" | "Urgent",
          project_id: projectId,
          assignee_id: data.assignee || null,
          due_date: data.dueDate ?? null,
        });
        toast.success("Task created");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save task"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter task title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue={task?.status ?? "To Do"}
                onValueChange={(v) => setValue("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                defaultValue={task?.priority ?? "Medium"}
                onValueChange={(v) => setValue("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              defaultValue={task?.assignee}
              onValueChange={(v) => setValue("assignee", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignees.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No team members
                  </SelectItem>
                ) : (
                  assignees.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
