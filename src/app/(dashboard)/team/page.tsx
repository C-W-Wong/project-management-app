"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Mail, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InviteMemberModal } from "@/components/modals/invite-member-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getAllProfiles } from "@/lib/queries";
import { getErrorMessage, getInitials } from "@/lib/formatters";
import type { Profile } from "@/types/database";

function departmentColor(dept: string) {
  switch (dept) {
    case "Management": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "Design Team": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    case "Engineering": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "Quality": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    default: return "";
  }
}

export default function TeamMembersPage() {
  const supabase = useMemo(() => createClient(), []);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadTeam() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllProfiles(supabase);
        if (active) setTeamMembers(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load team"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTeam();
    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team and invite new members
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-sm text-muted-foreground">
            Loading team members...
          </div>
        ) : error ? (
          <div className="col-span-full text-sm text-destructive">{error}</div>
        ) : teamMembers.length === 0 ? (
          <div className="col-span-full text-sm text-muted-foreground">
            No team members found.
          </div>
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <Avatar className="h-16 w-16">
                    {member.avatar_url && (
                      <AvatarImage src={member.avatar_url} />
                    )}
                    <AvatarFallback className="text-lg">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="mt-4 text-sm font-semibold">{member.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{member.role ?? "Team member"}</p>

                  {member.department && (
                    <Badge
                      variant="secondary"
                      className={`mt-2 ${departmentColor(member.department)}`}
                    >
                      {member.department}
                    </Badge>
                  )}

                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <p>{member.email}</p>
                    {member.phone && <p>{member.phone}</p>}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/messages/${member.id}`}>
                        <Mail className="mr-1 h-3 w-3" />
                        Message
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/team/${member.id}`}>
                        <User className="mr-1 h-3 w-3" />
                        Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
