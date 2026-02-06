"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/formatters";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  open,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  async function onSubmit(data: InviteFormData) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      toast.success("Invitation email sent");
      setSuccess(true);
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send invite"));
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSuccess(false);
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <p className="text-sm font-medium">Invitation sent!</p>
              <p className="text-xs text-muted-foreground">
                The team member will receive an email invitation.
              </p>
            </div>
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={(v) => setValue("role", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project Manager">
                    Project Manager
                  </SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                  <SelectItem value="Product Manager">
                    Product Manager
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
