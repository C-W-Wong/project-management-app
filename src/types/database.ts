export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  department: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "Planning" | "In Progress" | "Review" | "Completed";
  progress: number;
  due_date: string | null;
  created_by: string;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "To Do" | "In Progress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High" | "Urgent";
  size: "S" | "M" | "L" | "XL" | null;
  project_id: string;
  assignee_id: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
};

export type Meeting = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration: string;
  project_id: string | null;
  created_by: string;
  created_at: string;
};

export type MeetingAttendee = {
  meeting_id: string;
  profile_id: string;
};

export type Document = {
  id: string;
  name: string;
  file_size: number;
  file_type: string;
  category: string | null;
  storage_url: string;
  project_id: string;
  uploaded_by: string;
  created_at: string;
};

export type Comment = {
  id: string;
  content: string;
  task_id: string;
  author_id: string;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type TaskTag = {
  task_id: string;
  tag_id: string;
};

export type ProjectMember = {
  project_id: string;
  profile_id: string;
};
