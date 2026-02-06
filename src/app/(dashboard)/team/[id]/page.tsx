"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getProfileById } from "@/lib/queries";
import { getErrorMessage, getInitials } from "@/lib/formatters";
import type { Profile } from "@/types/database";

export default function TeamProfilePage() {
  const params = useParams();
  const profileId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;
    let active = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfileById(supabase, profileId);
        if (active) setProfile(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [profileId, supabase]);

  if (!profileId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Invalid member.</div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {loading ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Loading profile...
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : profile ? (
        <Card>
          <CardHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Avatar className="h-20 w-20">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="text-lg">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {profile.role ?? "Team member"}
              </p>
              {profile.department && (
                <p className="text-xs text-muted-foreground">
                  {profile.department}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {profile.email}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {profile.phone}
                </div>
              )}
              {profile.role && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  {profile.role}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/messages/${profile.id}`}>Message</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
