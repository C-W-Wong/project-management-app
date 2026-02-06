"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Calendar, Tag, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { getCommentsByTask, getProfilesByIds } from "@/lib/queries";
import { createComment } from "@/lib/mutations";
import { formatRelativeDate, getErrorMessage, getInitials } from "@/lib/formatters";
import type { Comment, Profile } from "@/types/database";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task?: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee: string;
    dueDate: string;
    project: string;
    tags: string[];
  };
}

function statusColor(status: string) {
  switch (status) {
    case "To Do":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "In Progress":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "Review":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Done":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default:
      return "";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "Urgent":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "High":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  }
}

export function TaskDetailModal({
  open,
  onClose,
  task,
}: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!open || !task?.id) {
      setComments([]);
      setProfiles({});
      setNewComment("");
      setLoading(false);
      return;
    }
    let active = true;
    async function loadComments() {
      setLoading(true);
      try {
        const data = await getCommentsByTask(supabase, task.id);
        const authorIds = Array.from(new Set(data.map((c) => c.author_id)));
        const authors = await getProfilesByIds(supabase, authorIds);
        const map = authors.reduce<Record<string, Profile>>((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
        if (active) {
          setComments(data);
          setProfiles(map);
        }
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load comments"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadComments();
    return () => {
      active = false;
    };
  }, [open, supabase, task?.id]);

  if (!open) return null;

  async function handleAddComment() {
    if (!newComment.trim() || !task?.id) return;
    try {
      const created = await createComment(supabase, {
        task_id: task.id,
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add comment"));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex h-[90vh] max-h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-background shadow-lg md:flex-row">
        {/* Left Panel */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 id="task-detail-title" className="text-xl font-semibold">
                {task?.title ?? "Task"}
              </h2>
              <div className="flex items-center gap-2">
                {task?.status && (
                  <Badge variant="secondary" className={statusColor(task.status)}>
                    {task.status}
                  </Badge>
                )}
                {task?.priority && (
                  <Badge
                    variant="secondary"
                    className={priorityColor(task.priority)}
                  >
                    {task.priority}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close task details">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">
              {task?.description ?? "No description provided."}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Comments */}
          <div className="flex flex-1 flex-col space-y-4">
            <h3 className="text-sm font-medium">
              Comments ({comments.length})
            </h3>
            <div className="flex-1 space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                comments.map((comment) => {
                  const author = profiles[comment.author_id];
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        {author?.avatar_url && (
                          <AvatarImage src={author.avatar_url} />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(author?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {author?.full_name ?? "Team member"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                className="min-h-[60px] flex-1"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button size="icon" onClick={handleAddComment} aria-label="Send comment">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full border-t bg-muted/30 p-4 sm:p-6 md:w-64 md:border-l md:border-t-0 overflow-y-auto space-y-6">
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Assignee
            </span>
            <div className="mt-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">
                  {getInitials(task?.assignee)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{task?.assignee ?? "Unassigned"}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Due Date
            </span>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {task?.dueDate ?? "—"}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Project
            </span>
            <p className="mt-2 text-sm">{task?.project ?? "—"}</p>
          </div>

          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Tags
            </span>
            <div className="mt-2 flex flex-wrap gap-1">
              {task?.tags?.length ? (
                task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
