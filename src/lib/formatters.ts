import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export function getInitials(name?: string | null, fallback = "?") {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatDate(date?: string | null, pattern = "MMM d, yyyy") {
  if (!date) return "";
  const parsed = parseISO(date);
  if (!isValid(parsed)) return date;
  return format(parsed, pattern);
}

export function formatDateShort(date?: string | null) {
  return formatDate(date, "MMM d");
}

export function formatRelativeDate(date?: string | null) {
  if (!date) return "";
  const parsed = parseISO(date);
  if (!isValid(parsed)) return date;
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

export function formatTime(time?: string | null) {
  if (!time) return "";
  // Accept HH:MM or HH:MM:SS
  const normalized = time.length === 5 ? `${time}:00` : time;
  const parsed = parseISO(`1970-01-01T${normalized}`);
  if (!isValid(parsed)) return time;
  return format(parsed, "h:mm a");
}

export function bytesToSize(bytes?: number | null) {
  if (!bytes && bytes !== 0) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "object" && "message" in (error as Record<string, unknown>)) {
    const message = (error as { message?: string }).message;
    return message || fallback;
  }
  return fallback;
}
