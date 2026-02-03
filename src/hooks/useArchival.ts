import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for archival system
export interface ArchivalObject {
  id: string;
  target_type: "publication" | "dataset" | "research_timeline" | "knowledge_node" | "workspace_snapshot";
  target_id: string;
  archival_format: "pdfa" | "xml" | "json" | "csv" | "markdown_bundle" | "bagit";
  checksum: string;
  size_mb: number | null;
  archived_at: string;
  archival_status: "active" | "migrated" | "deprecated";
  storage_location: string | null;
  metadata: Record<string, unknown>;
}

export interface ArchivalSnapshot {
  id: string;
  archival_object_id: string;
  snapshot_reason: "publication" | "funding_closeout" | "project_completion" | "periodic" | "manual" | "migration";
  snapshot_metadata: Record<string, unknown>;
  created_at: string;
}

export interface FormatMigration {
  id: string;
  archival_object_id: string;
  from_format: string;
  to_format: string;
  migration_reason: string;
  migration_notes: string | null;
  migrated_by: string | null;
  migrated_at: string;
}

export interface ScholarlyLegacyProfile {
  id: string;
  scholar_passport_id: string;
  legacy_visibility: "private" | "public" | "institutional";
  designated_heirs: string[];
  preservation_preferences: Record<string, unknown>;
  legacy_statement: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreservationAuditLog {
  id: string;
  archival_object_id: string;
  action_type: "archived" | "verified" | "migrated" | "accessed" | "integrity_check" | "restored";
  performed_by: string | null;
  details: Record<string, unknown>;
  performed_at: string;
}

export function useArchival() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch archived objects
  const fetchArchivedObjects = useCallback(async (filters?: {
    targetType?: string;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("archival_objects").select("*");
      
      if (filters?.targetType) {
        query = query.eq("target_type", filters.targetType);
      }
      if (filters?.status) {
        query = query.eq("archival_status", filters.status);
      }
      
      const { data, error: fetchError } = await query.order("archived_at", { ascending: false });
      if (fetchError) throw fetchError;
      return data as ArchivalObject[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch archived objects");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch snapshots for an archival object
  const fetchSnapshots = useCallback(async (archivalObjectId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("archival_snapshots")
        .select("*")
        .eq("archival_object_id", archivalObjectId)
        .order("created_at", { ascending: false });
      
      if (fetchError) throw fetchError;
      return data as ArchivalSnapshot[];
    } catch (err) {
      console.error("Error fetching snapshots:", err);
      return [];
    }
  }, []);

  // Fetch format migrations for an archival object
  const fetchMigrations = useCallback(async (archivalObjectId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("format_migration_records")
        .select("*")
        .eq("archival_object_id", archivalObjectId)
        .order("migrated_at", { ascending: false });
      
      if (fetchError) throw fetchError;
      return data as FormatMigration[];
    } catch (err) {
      console.error("Error fetching migrations:", err);
      return [];
    }
  }, []);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async (archivalObjectId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("preservation_audit_logs")
        .select("*")
        .eq("archival_object_id", archivalObjectId)
        .order("performed_at", { ascending: false });
      
      if (fetchError) throw fetchError;
      return data as PreservationAuditLog[];
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    fetchArchivedObjects,
    fetchSnapshots,
    fetchMigrations,
    fetchAuditLogs,
  };
}

export function useLegacyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ScholarlyLegacyProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's legacy profile
  const fetchLegacyProfile = useCallback(async (scholarPassportId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scholarly_legacy_profiles")
        .select("*")
        .eq("scholar_passport_id", scholarPassportId)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data as ScholarlyLegacyProfile | null);
      return data as ScholarlyLegacyProfile | null;
    } catch (err) {
      console.error("Error fetching legacy profile:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or update legacy profile
  const upsertLegacyProfile = useCallback(async (
    scholarPassportId: string,
    updates: Partial<Omit<ScholarlyLegacyProfile, "id" | "scholar_passport_id" | "created_at" | "updated_at">>
  ) => {
    try {
      // First try to get existing profile
      const { data: existing } = await supabase
        .from("scholarly_legacy_profiles")
        .select("id")
        .eq("scholar_passport_id", scholarPassportId)
        .maybeSingle();
      
      const updatePayload = {
        legacy_visibility: updates.legacy_visibility,
        designated_heirs: updates.designated_heirs,
        preservation_preferences: updates.preservation_preferences as unknown as Record<string, unknown>,
        legacy_statement: updates.legacy_statement,
      };
      
      let data;
      let error;
      
      if (existing) {
        const result = await supabase
          .from("scholarly_legacy_profiles")
          .update(updatePayload as any)
          .eq("id", existing.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from("scholarly_legacy_profiles")
          .insert({
            scholar_passport_id: scholarPassportId,
            ...updatePayload,
          } as any)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      setProfile(data as ScholarlyLegacyProfile);
      return data as ScholarlyLegacyProfile;
    } catch (err) {
      console.error("Error upserting legacy profile:", err);
      throw err;
    }
  }, []);

  return {
    profile,
    loading,
    fetchLegacyProfile,
    upsertLegacyProfile,
  };
}
