"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getCurrentProfile,
  getCurrentUserId,
  getNotificationPreferences,
} from "@/lib/queries";
import {
  updateProfile,
  uploadAvatar,
  upsertNotificationPreferences,
} from "@/lib/mutations";
import { getErrorMessage, getInitials } from "@/lib/formatters";
import type { Profile } from "@/types/database";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "security", label: "Security" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCurrentProfile(supabase);
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
  }, [supabase]);

  async function handleProfileSave(updates: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    try {
      const fullName = `${updates.firstName} ${updates.lastName}`.trim();
      if (updates.email && updates.email !== profile?.email) {
        const { error } = await supabase.auth.updateUser({ email: updates.email });
        if (error) throw error;
        toast.info("Check your email to confirm the new address");
      }
      const updated = await updateProfile(supabase, {
        full_name: fullName || updates.email,
        email: updates.email,
        phone: updates.phone,
      });
      setProfile(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    }
  }

  async function handleAvatarChange(file: File) {
    try {
      const updated = await uploadAvatar(supabase, file);
      setProfile(updated);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload avatar"));
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Settings Sidebar */}
        <nav className="flex gap-1 overflow-x-auto sm:w-48 sm:flex-col sm:space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-muted font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile}
              loading={loading}
              error={error}
              onSave={handleProfileSave}
              onAvatarChange={handleAvatarChange}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationsTab supabase={supabase} />
          )}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "security" && <SecurityTab supabase={supabase} />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({
  profile,
  loading,
  error,
  onSave,
  onAvatarChange,
}: {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  onSave: (updates: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => void;
  onAvatarChange: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!profile) return;
    const parts = profile.full_name?.split(" ") ?? [];
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" "));
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onAvatarChange(file);
  }

  function handleSave() {
    onSave({ firstName, lastName, email, phone });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="text-lg">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={handleAvatarClick}>
            Change Avatar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <Separator />

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Edit Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab({
  supabase,
}: {
  supabase: ReturnType<typeof createClient>;
}) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPreferences() {
      try {
        const userId = await getCurrentUserId(supabase);
        if (!userId) throw new Error("User not authenticated");
        const prefs = await getNotificationPreferences(supabase, userId);
        if (!active) return;
        if (prefs) {
          setEmailNotifications(prefs.email_enabled);
          setPushNotifications(prefs.push_enabled);
          setMeetingReminders(prefs.meeting_reminders);
        }
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load preferences"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPreferences();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function persistChanges(next: {
    email: boolean;
    push: boolean;
    meetings: boolean;
  }) {
    try {
      setLoading(true);
      await upsertNotificationPreferences(supabase, {
        email_enabled: next.email,
        push_enabled: next.push,
        meeting_reminders: next.meetings,
      });
      toast.success("Preferences updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update preferences"));
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email Notifications</p>
            <p className="text-xs text-muted-foreground">
              Receive email updates about your projects
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={(checked) => {
              setEmailNotifications(checked);
              persistChanges({
                email: checked,
                push: pushNotifications,
                meetings: meetingReminders,
              });
            }}
            disabled={loading}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-xs text-muted-foreground">
              Get push notifications in your browser
            </p>
          </div>
          <Switch
            checked={pushNotifications}
            onCheckedChange={(checked) => {
              setPushNotifications(checked);
              persistChanges({
                email: emailNotifications,
                push: checked,
                meetings: meetingReminders,
              });
            }}
            disabled={loading}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Meeting Reminders</p>
            <p className="text-xs text-muted-foreground">
              Get reminded before upcoming meetings
            </p>
          </div>
          <Switch
            checked={meetingReminders}
            onCheckedChange={(checked) => {
              setMeetingReminders(checked);
              persistChanges({
                email: emailNotifications,
                push: pushNotifications,
                meetings: checked,
              });
            }}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of the application. Theme settings are
          managed via your system preferences or the theme toggle.
        </p>
      </CardContent>
    </Card>
  );
}

function SecurityTab({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <Input
            id="confirmNewPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleUpdatePassword} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
