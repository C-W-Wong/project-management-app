"use client";

import { Plus, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  color: string;
}

const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Smith", initials: "AS", role: "Project Manager", department: "Management", email: "alex@company.com", phone: "+1 234 567 890", color: "bg-blue-500" },
  { id: "2", name: "Jane Kim", initials: "JK", role: "UI/UX Designer", department: "Design Team", email: "jane@company.com", phone: "+1 234 567 891", color: "bg-purple-500" },
  { id: "3", name: "Mark Lee", initials: "ML", role: "Frontend Developer", department: "Engineering", email: "mark@company.com", phone: "+1 234 567 892", color: "bg-green-500" },
  { id: "4", name: "Rachel Davis", initials: "RD", role: "Backend Developer", department: "Engineering", email: "rachel@company.com", phone: "+1 234 567 893", color: "bg-orange-500" },
  { id: "5", name: "Tom Wilson", initials: "TW", role: "QA Engineer", department: "Quality", email: "tom@company.com", phone: "+1 234 567 894", color: "bg-red-500" },
  { id: "6", name: "Sarah King", initials: "SK", role: "Product Designer", department: "Design Team", email: "sarah@company.com", phone: "+1 234 567 895", color: "bg-pink-500" },
];

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${member.color} text-white text-lg font-semibold`}
                >
                  {member.initials}
                </div>

                <h3 className="mt-4 text-sm font-semibold">{member.name}</h3>
                <p className="text-xs text-muted-foreground">{member.role}</p>

                <Badge
                  variant="secondary"
                  className={`mt-2 ${departmentColor(member.department)}`}
                >
                  {member.department}
                </Badge>

                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <p>{member.email}</p>
                  <p>{member.phone}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="mr-1 h-3 w-3" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="mr-1 h-3 w-3" />
                    Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
