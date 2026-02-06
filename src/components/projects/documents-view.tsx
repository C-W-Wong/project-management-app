"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Upload, Search, FileText, Image as ImageIcon, FileSpreadsheet, FileCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getDocumentsByProject } from "@/lib/queries";
import { uploadDocument } from "@/lib/mutations";
import { bytesToSize, formatDate, getErrorMessage } from "@/lib/formatters";
import type { Document } from "@/types/database";

function getFileIcon(type: string) {
  const normalized = type.includes("/") ? type.split("/").pop() ?? type : type;
  switch (type) {
    case "pdf":
    case "application/pdf":
      return <FileText className="h-8 w-8 text-red-500" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "image/png":
    case "image/jpeg":
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    case "xlsx":
    case "sheet":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    case "json":
    case "application/json":
      return <FileCode className="h-8 w-8 text-yellow-500" />;
    default:
      if (normalized === "pdf") return <FileText className="h-8 w-8 text-red-500" />;
      if (["png", "jpg", "jpeg", "gif"].includes(normalized))
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      if (["xls", "xlsx", "csv"].includes(normalized))
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      if (["json", "js", "ts"].includes(normalized))
        return <FileCode className="h-8 w-8 text-yellow-500" />;
      return <FileText className="h-8 w-8 text-muted-foreground" />;
  }
}

interface DocumentsViewProps {
  projectId: string;
  refreshKey?: number;
  onUploaded?: () => void;
}

export function DocumentsView({
  projectId,
  refreshKey = 0,
  onUploaded,
}: DocumentsViewProps) {
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;
    async function loadDocuments() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDocumentsByProject(supabase, projectId);
        if (active) setDocuments(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load documents"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDocuments();
    return () => {
      active = false;
    };
  }, [projectId, refreshKey, supabase]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(supabase, { projectId, file });
      toast.success("Document uploaded");
      onUploaded?.();
      const data = await getDocumentsByProject(supabase, projectId);
      setDocuments(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload document"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const filtered = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Project Documents</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-9 w-full sm:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search documents"
            />
          </div>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-sm text-muted-foreground">Loading documents...</div>
        ) : error ? (
          <div className="col-span-full text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-sm text-muted-foreground">
            No documents found.
          </div>
        ) : (
          filtered.map((doc) => (
            <Card
              key={doc.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => window.open(doc.storage_url, "_blank")}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {bytesToSize(doc.file_size)}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                  {doc.category && (
                    <Badge variant="secondary" className="text-[10px]">
                      {doc.category}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
