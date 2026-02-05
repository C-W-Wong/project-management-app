"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  Settings,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Meetings", href: "/meetings", icon: Calendar },
];

const teamNavItems = [
  { label: "Team Members", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-2",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-md p-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent">
            <span className="text-sm font-bold text-sidebar-foreground">P</span>
          </div>
          <span className="text-base font-semibold text-sidebar-foreground">
            ProjectHub
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5">
        <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Main
        </span>
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <span className="mt-4 px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Team
        </span>
        {teamNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-md bg-sidebar p-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              John Doe
            </span>
            <span className="text-xs text-muted-foreground">
              Project Manager
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </aside>
  );
}
