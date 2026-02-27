
-- Phase 2B: Secure File Storage + Document Versioning Infrastructure

-- ============================================================
-- 1. PRIVATE STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('private_project_files', 'private_project_files', false, 20971520,
   ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/png','image/jpeg','image/webp','application/zip']::text[]),
  ('milestone_deliverables', 'milestone_deliverables', false, 20971520,
   ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/png','image/jpeg','image/webp','application/zip']::text[]),
  ('dispute_evidence', 'dispute_evidence', false, 20971520,
   ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','image/webp','application/zip']::text[]),
  ('institutional_documents', 'institutional_documents', false, 20971520,
   ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/png','image/jpeg']::text[]),
  ('profile_assets', 'profile_assets', false, 5242880,
   ARRAY['image/png','image/jpeg','image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. STORAGE RLS POLICIES (authenticated upload, owner access)
-- ============================================================

-- Private project files: authenticated users can upload to their own path
CREATE POLICY "auth_upload_project_files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'private_project_files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "auth_read_own_project_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'private_project_files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Milestone deliverables
CREATE POLICY "auth_upload_milestone_files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'milestone_deliverables' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "auth_read_milestone_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'milestone_deliverables');

-- Dispute evidence
CREATE POLICY "auth_upload_dispute_evidence" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dispute_evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "auth_read_dispute_evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'dispute_evidence');

-- Institutional documents
CREATE POLICY "auth_upload_institutional_docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'institutional_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "auth_read_institutional_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'institutional_documents');

-- Profile assets
CREATE POLICY "auth_upload_profile_assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile_assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "auth_read_own_profile_assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile_assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 3. FILES TABLE (versioned, entity-linked)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NULL,
  milestone_id UUID NULL REFERENCES public.milestones(id),
  dispute_id UUID NULL REFERENCES public.disputes(id),
  institution_id UUID NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'milestone', 'dispute', 'institution', 'profile')),
  entity_id UUID NOT NULL,
  bucket_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  version_number INT NOT NULL DEFAULT 1,
  is_latest_version BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_files_entity ON public.files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_uploader ON public.files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_files_milestone ON public.files(milestone_id) WHERE milestone_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_files_dispute ON public.files(dispute_id) WHERE dispute_id IS NOT NULL;

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_files" ON public.files
  FOR SELECT TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "users_read_linked_files" ON public.files
  FOR SELECT TO authenticated
  USING (
    -- Project participants can see project files
    (entity_type = 'project' AND entity_id IN (
      SELECT id FROM offers WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
    ))
    OR
    -- Milestone files visible to offer participants
    (entity_type = 'milestone' AND milestone_id IN (
      SELECT m.id FROM milestones m JOIN offers o ON o.id = m.offer_id
      WHERE o.sender_id = auth.uid() OR o.recipient_id = auth.uid()
    ))
    OR
    -- Dispute files visible to dispute participants
    (entity_type = 'dispute' AND dispute_id IN (
      SELECT d.id FROM disputes d JOIN milestones m ON m.id = d.milestone_id JOIN offers o ON o.id = m.offer_id
      WHERE o.sender_id = auth.uid() OR o.recipient_id = auth.uid()
    ))
  );

CREATE POLICY "users_insert_own_files" ON public.files
  FOR INSERT TO authenticated
  WITH CHECK (uploader_id = auth.uid());

-- Soft delete only (no hard delete from client)
CREATE POLICY "users_update_own_files" ON public.files
  FOR UPDATE TO authenticated
  USING (uploader_id = auth.uid())
  WITH CHECK (uploader_id = auth.uid());

-- ============================================================
-- 4. FILE ACCESS LOG (immutable audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.file_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_id UUID NOT NULL REFERENCES public.files(id),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'upload', 'delete')),
  ip_address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_file_access_log_file ON public.file_access_log(file_id);
CREATE INDEX IF NOT EXISTS idx_file_access_log_user ON public.file_access_log(user_id);

ALTER TABLE public.file_access_log ENABLE ROW LEVEL SECURITY;

-- Append-only: users can insert their own access logs
CREATE POLICY "users_log_own_access" ON public.file_access_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_read_own_access_log" ON public.file_access_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Immutability trigger
CREATE OR REPLACE FUNCTION public.prevent_access_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'File access log is append-only';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS enforce_access_log_immutability_update ON public.file_access_log;
CREATE TRIGGER enforce_access_log_immutability_update
  BEFORE UPDATE ON public.file_access_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_access_log_mutation();

DROP TRIGGER IF EXISTS enforce_access_log_immutability_delete ON public.file_access_log;
CREATE TRIGGER enforce_access_log_immutability_delete
  BEFORE DELETE ON public.file_access_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_access_log_mutation();

-- ============================================================
-- 5. FILE SECURITY EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.file_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('invalid_mime', 'oversized', 'rate_limited', 'unauthorized_access', 'deletion_attempt', 'suspicious_upload')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_id UUID NULL REFERENCES public.files(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.file_security_events ENABLE ROW LEVEL SECURITY;

-- Only insert, no read from client (admin-only via service role)
CREATE POLICY "system_insert_security_events" ON public.file_security_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. PREVENT DISPUTE EVIDENCE DELETION
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_dispute_file_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.entity_type = 'dispute' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    -- Check if dispute is still open
    IF EXISTS (
      SELECT 1 FROM disputes WHERE id = OLD.dispute_id AND status IN ('open', 'under_review')
    ) THEN
      RAISE EXCEPTION 'Cannot delete evidence files while dispute is open';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_dispute_evidence ON public.files;
CREATE TRIGGER protect_dispute_evidence
  BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION public.prevent_dispute_file_deletion();

-- ============================================================
-- 7. SERVER FUNCTION: Register file + get signed URL
-- ============================================================
CREATE OR REPLACE FUNCTION public.register_file_upload(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_file_name TEXT,
  p_storage_path TEXT,
  p_mime_type TEXT,
  p_file_size BIGINT,
  p_bucket_id TEXT,
  p_milestone_id UUID DEFAULT NULL,
  p_dispute_id UUID DEFAULT NULL,
  p_institution_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_version INT;
  v_file_id UUID;
  v_allowed_mimes TEXT[] := ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png', 'image/jpeg', 'image/webp',
    'application/zip'
  ];
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Validate MIME type
  IF NOT (p_mime_type = ANY(v_allowed_mimes)) THEN
    INSERT INTO file_security_events (event_type, user_id, details)
    VALUES ('invalid_mime', v_user_id, jsonb_build_object('mime_type', p_mime_type, 'file_name', p_file_name));
    RAISE EXCEPTION 'File type not allowed: %', p_mime_type;
  END IF;

  -- Validate file size (20MB max)
  IF p_file_size > 20971520 THEN
    INSERT INTO file_security_events (event_type, user_id, details)
    VALUES ('oversized', v_user_id, jsonb_build_object('size', p_file_size, 'file_name', p_file_name));
    RAISE EXCEPTION 'File exceeds maximum size of 20MB';
  END IF;

  -- Determine version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version
  FROM files
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id
    AND file_name = p_file_name AND deleted_at IS NULL;

  -- Mark previous versions as not latest
  UPDATE files SET is_latest_version = false
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id
    AND file_name = p_file_name AND is_latest_version = true;

  -- Insert new file record
  INSERT INTO files (
    uploader_id, project_id, milestone_id, dispute_id, institution_id,
    entity_type, entity_id, bucket_id, file_name, storage_path,
    mime_type, file_size, version_number, is_latest_version
  ) VALUES (
    v_user_id, p_project_id, p_milestone_id, p_dispute_id, p_institution_id,
    p_entity_type, p_entity_id, p_bucket_id, p_file_name, p_storage_path,
    p_mime_type, p_file_size, v_version, true
  ) RETURNING id INTO v_file_id;

  -- Log upload
  INSERT INTO file_access_log (user_id, file_id, access_type)
  VALUES (v_user_id, v_file_id, 'upload');

  RETURN jsonb_build_object(
    'file_id', v_file_id,
    'version', v_version,
    'storage_path', p_storage_path,
    'bucket_id', p_bucket_id
  );
END;
$$;
