"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "security", label: "Security" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

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
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">AS</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            Change Avatar
          </Button>
        </div>

        <Separator />

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue="Alex" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue="Smith" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="alex@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" defaultValue="+1 234 567 890" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Edit Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
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
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-xs text-muted-foreground">
              Get push notifications in your browser
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Meeting Reminders</p>
            <p className="text-xs text-muted-foreground">
              Get reminded before upcoming meetings
            </p>
          </div>
          <Switch defaultChecked />
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

function SecurityTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <Input id="confirmNewPassword" type="password" />
        </div>
        <div className="flex justify-end">
          <Button>Update Password</Button>
        </div>
      </CardContent>
    </Card>
  );
}
