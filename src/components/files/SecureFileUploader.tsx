/**
 * SecureFileUploader — Drag & drop file upload with validation, progress, and entity linking.
 * All uploads go through private buckets via useFileStorage.
 */

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, Download, Clock, Shield, History } from 'lucide-react';
import { useFileUpload, useLatestFiles, useSignedUrl, useSoftDeleteFile, type FileEntityType, type FileRecord } from '@/hooks/useFileStorage';
import { useAuth } from '@/contexts/AuthContext';

interface SecureFileUploaderProps {
  entityType: FileEntityType;
  entityId: string;
  milestoneId?: string;
  disputeId?: string;
  institutionId?: string;
  projectId?: string;
  title?: string;
  allowDelete?: boolean;
  maxFiles?: number;
}

const MIME_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WEBP',
  'application/zip': 'ZIP',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SecureFileUploader({
  entityType,
  entityId,
  milestoneId,
  disputeId,
  institutionId,
  projectId,
  title = 'Files & Deliverables',
  allowDelete = true,
  maxFiles = 20,
}: SecureFileUploaderProps) {
  const { user } = useAuth();
  const { upload, uploading, progress } = useFileUpload();
  const { data: files = [], isLoading } = useLatestFiles(entityType, entityId);
  const { getSignedUrl } = useSignedUrl();
  const softDelete = useSoftDeleteFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const fileArray = Array.from(fileList).slice(0, maxFiles - files.length);
    for (const file of fileArray) {
      await upload({
        file,
        entityType,
        entityId,
        milestoneId,
        disputeId,
        institutionId,
        projectId,
      });
    }
  }, [upload, entityType, entityId, milestoneId, disputeId, institutionId, projectId, files.length, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDownload = async (file: FileRecord) => {
    const url = await getSignedUrl(file);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-primary" />
          {title}
          <Badge variant="secondary" className="ml-auto text-xs">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, DOCX, XLSX, PPTX, PNG, JPG, ZIP — Max 20MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.zip"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{progress}%</p>
          </div>
        )}

        {/* File List */}
        {isLoading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-4">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {MIME_LABELS[file.mime_type] || file.mime_type.split('/')[1]}
                    </Badge>
                    <span>{formatFileSize(file.file_size)}</span>
                    {file.version_number > 1 && (
                      <span className="flex items-center gap-0.5">
                        <History className="h-3 w-3" />
                        v{file.version_number}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(file)}
                    title="Download via signed URL"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {allowDelete && file.uploader_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => softDelete.mutate(file.id)}
                      disabled={softDelete.isPending}
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
