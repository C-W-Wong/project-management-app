"use client";

import { useState } from "react";
import { Upload, Search, FileText, Image, FileSpreadsheet, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentItem {
  id: string;
  name: string;
  fileType: string;
  fileSize: string;
  category: string;
  uploadedAt: string;
}

const documents: DocumentItem[] = [
  { id: "1", name: "Homepage Design.pdf", fileType: "pdf", fileSize: "2.4 MB", category: "Design deliverables", uploadedAt: "Feb 3, 2026" },
  { id: "2", name: "Brand Guidelines.pdf", fileType: "pdf", fileSize: "5.1 MB", category: "Design deliverables", uploadedAt: "Jan 28, 2026" },
  { id: "3", name: "Wireframes.png", fileType: "png", fileSize: "1.8 MB", category: "Design deliverables", uploadedAt: "Jan 25, 2026" },
  { id: "4", name: "Budget Report.xlsx", fileType: "xlsx", fileSize: "890 KB", category: "Project", uploadedAt: "Feb 1, 2026" },
  { id: "5", name: "API Schema.json", fileType: "json", fileSize: "45 KB", category: "Technical", uploadedAt: "Feb 2, 2026" },
  { id: "6", name: "Meeting Notes.pdf", fileType: "pdf", fileSize: "320 KB", category: "Project", uploadedAt: "Feb 4, 2026" },
];

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileText className="h-8 w-8 text-red-500" />;
    case "png":
    case "jpg":
      return <Image className="h-8 w-8 text-blue-500" />;
    case "xlsx":
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    case "json":
      return <FileCode className="h-8 w-8 text-yellow-500" />;
    default:
      return <FileText className="h-8 w-8 text-muted-foreground" />;
  }
}

export function DocumentsView() {
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Documents</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-9 w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc) => (
          <Card key={doc.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                {getFileIcon(doc.fileType)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{doc.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{doc.fileSize}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{doc.uploadedAt}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {doc.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
