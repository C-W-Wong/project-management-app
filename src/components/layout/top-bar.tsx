"use client";

import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      {/* Search */}
      <div className="hidden items-center gap-2 rounded-md bg-muted px-3 py-2 sm:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Search projects, tasks...
        </span>
      </div>
      <div className="sm:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 sm:hidden" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
