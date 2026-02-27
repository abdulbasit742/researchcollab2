/**
 * useFileStorage — Secure file upload, signed URL access, versioning, and audit logging.
 * All uploads go through private buckets. All access via signed URLs.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

export type FileEntityType = 'project' | 'milestone' | 'dispute' | 'institution' | 'profile';

export interface FileRecord {
  id: string;
  uploader_id: string;
  entity_type: FileEntityType;
  entity_id: string;
  bucket_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  version_number: number;
  is_latest_version: boolean;
  uploaded_at: string;
  deleted_at: string | null;
}

const BUCKET_MAP: Record<FileEntityType, string> = {
  project: 'private_project_files',
  milestone: 'milestone_deliverables',
  dispute: 'dispute_evidence',
  institution: 'institutional_documents',
  profile: 'profile_assets',
};

const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/zip',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// ============================================================
// UPLOAD HOOK
// ============================================================

export function useFileUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (params: {
    file: File;
    entityType: FileEntityType;
    entityId: string;
    milestoneId?: string;
    disputeId?: string;
    institutionId?: string;
    projectId?: string;
  }): Promise<FileRecord | null> => {
    if (!user) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return null;
    }

    const { file, entityType, entityId } = params;

    // Client-side validation (server also validates)
    if (!ALLOWED_MIMES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: `${file.type} is not allowed`, variant: 'destructive' });
      return null;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'File too large', description: 'Maximum file size is 20MB', variant: 'destructive' });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const bucket = BUCKET_MAP[entityType];
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${user.id}/${entityId}/${timestamp}_${safeName}`;

      setProgress(20);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      setProgress(60);

      // Register file in DB via server function
      const { data, error: regError } = await supabase.rpc('register_file_upload' as any, {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_file_name: file.name,
        p_storage_path: storagePath,
        p_mime_type: file.type,
        p_file_size: file.size,
        p_bucket_id: bucket,
        p_milestone_id: params.milestoneId ?? null,
        p_dispute_id: params.disputeId ?? null,
        p_institution_id: params.institutionId ?? null,
        p_project_id: params.projectId ?? null,
      });

      if (regError) throw regError;
      setProgress(100);

      toast({ title: 'File uploaded', description: file.name });
      qc.invalidateQueries({ queryKey: ['files', entityType, entityId] });

      return {
        id: (data as any).file_id,
        uploader_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        bucket_id: bucket,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
        version_number: (data as any).version,
        is_latest_version: true,
        uploaded_at: new Date().toISOString(),
        deleted_at: null,
      };
    } catch (err: any) {
      console.error('File upload error:', err);
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}

// ============================================================
// LIST FILES HOOK
// ============================================================

export function useEntityFiles(entityType: FileEntityType, entityId?: string) {
  return useQuery({
    queryKey: ['files', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await (supabase as any)
        .from('files')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as FileRecord[];
    },
    enabled: !!entityId,
  });
}

export function useLatestFiles(entityType: FileEntityType, entityId?: string) {
  return useQuery({
    queryKey: ['files', entityType, entityId, 'latest'],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await (supabase as any)
        .from('files')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_latest_version', true)
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as FileRecord[];
    },
    enabled: !!entityId,
  });
}

// ============================================================
// SIGNED URL HOOK
// ============================================================

export function useSignedUrl() {
  const { user } = useAuth();

  const getSignedUrl = async (file: FileRecord, expiresIn = 300): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.storage
        .from(file.bucket_id)
        .createSignedUrl(file.storage_path, expiresIn);

      if (error) throw error;

      // Log access
      await (supabase as any).from('file_access_log').insert({
        user_id: user.id,
        file_id: file.id,
        access_type: 'download',
      });

      return data.signedUrl;
    } catch (err) {
      console.error('Signed URL error:', err);
      return null;
    }
  };

  return { getSignedUrl };
}

// ============================================================
// SOFT DELETE HOOK
// ============================================================

export function useSoftDeleteFile() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await (supabase as any)
        .from('files')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'File removed' });
      qc.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    },
  });
}

// ============================================================
// FILE VERSION HISTORY
// ============================================================

export function useFileVersions(entityType: FileEntityType, entityId?: string, fileName?: string) {
  return useQuery({
    queryKey: ['files', 'versions', entityType, entityId, fileName],
    queryFn: async () => {
      if (!entityId || !fileName) return [];
      const { data, error } = await (supabase as any)
        .from('files')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('file_name', fileName)
        .is('deleted_at', null)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return (data ?? []) as FileRecord[];
    },
    enabled: !!entityId && !!fileName,
  });
}
