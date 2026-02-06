"use client";

import { useState } from "react";
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
import { createProject, updateProject } from "@/lib/mutations";
import { getErrorMessage } from "@/lib/formatters";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.string(),
  dueDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project?: {
    id: string;
    name: string;
    description: string;
    status: string;
    dueDate: string;
  };
}

export function CreateProjectModal({
  open,
  onClose,
  onSuccess,
  project,
}: CreateProjectModalProps) {
  const isEdit = !!project;
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description,
          status: project.status,
          dueDate: project.dueDate,
        }
      : {
          status: "Planning",
        },
  });

  async function onSubmit(data: ProjectFormData) {
    setLoading(true);
    try {
      if (isEdit && project) {
        await updateProject(supabase, project.id, {
          name: data.name,
          description: data.description ?? null,
          status: data.status as "Planning" | "In Progress" | "Review" | "Completed",
          due_date: data.dueDate ?? null,
        });
        toast.success("Project updated");
      } else {
        await createProject(supabase, {
          name: data.name,
          description: data.description ?? null,
          status: data.status as "Planning" | "In Progress" | "Review" | "Completed",
          due_date: data.dueDate ?? null,
        });
        toast.success("Project created");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save project"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" placeholder="Enter project name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project..."
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              defaultValue={project?.status ?? "Planning"}
              onValueChange={(v) => setValue("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
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
              {loading
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
