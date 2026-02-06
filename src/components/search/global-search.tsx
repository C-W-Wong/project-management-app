"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchResult {
  type: "project" | "task" | "meeting";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export function GlobalSearch() {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      return;
    }
    if (!query) {
      setResults([]);
      setError(null);
      return;
    }

    let active = true;
    async function runSearch() {
      setLoading(true);
      setError(null);
      try {
        const [projectsRes, tasksRes, meetingsRes] = await Promise.all([
          supabase
            .from("projects")
            .select("id, name, description")
            .ilike("name", `%${query}%`)
            .limit(5),
          supabase
            .from("tasks")
            .select("id, title, project_id")
            .ilike("title", `%${query}%`)
            .limit(5),
          supabase
            .from("meetings")
            .select("id, title, date")
            .ilike("title", `%${query}%`)
            .limit(5),
        ]);

        if (projectsRes.error) throw projectsRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (meetingsRes.error) throw meetingsRes.error;

        const mapped: SearchResult[] = [];

        for (const project of projectsRes.data ?? []) {
          mapped.push({
            type: "project",
            id: project.id,
            title: project.name,
            subtitle: project.description ?? undefined,
            href: `/projects/${project.id}`,
          });
        }

        for (const task of tasksRes.data ?? []) {
          mapped.push({
            type: "task",
            id: task.id,
            title: task.title,
            subtitle: "Task",
            href: `/projects/${task.project_id}`,
          });
        }

        for (const meeting of meetingsRes.data ?? []) {
          mapped.push({
            type: "meeting",
            id: meeting.id,
            title: meeting.title,
            subtitle: meeting.date,
            href: "/meetings",
          });
        }

        if (active) setResults(mapped);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Search failed"));
      } finally {
        if (active) setLoading(false);
      }
    }

    runSearch();
    return () => {
      active = false;
    };
  }, [open, query, supabase]);

  return (
    <>
      <Button
        variant="outline"
        className="hidden items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        Search projects, tasks...
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 sm:hidden"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Search projects, tasks, meetings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {loading && (
              <p className="text-sm text-muted-foreground">Searching...</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {!loading && !error && query && results.length === 0 && (
              <p className="text-sm text-muted-foreground">No results.</p>
            )}

            <div className="space-y-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  className="block rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.type}
                    </span>
                  </div>
                  {result.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {result.subtitle}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
