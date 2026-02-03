import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface SchemaVersion {
  id: string;
  version: string;
  description: string;
  applied_at: string;
  applied_by: string | null;
  is_active: boolean;
  rollback_sql: string | null;
  migration_sql: string | null;
}

export interface SchemaChange {
  id: string;
  schema_version_id: string | null;
  change_type: string;
  table_name: string | null;
  old_definition: Json | null;
  new_definition: Json | null;
  backward_compatible: boolean;
  deprecation_notice: string | null;
  deprecation_deadline: string | null;
  created_at: string;
}

export function useSchemaVersioning() {
  const [versions, setVersions] = useState<SchemaVersion[]>([]);
  const [changes, setChanges] = useState<SchemaChange[]>([]);
  const [activeVersion, setActiveVersion] = useState<SchemaVersion | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    const { data, error } = await supabase
      .from("schema_versions")
      .select("*")
      .order("applied_at", { ascending: false });

    if (!error && data) {
      setVersions(data as SchemaVersion[]);
      const active = data.find((v) => v.is_active);
      setActiveVersion(active as SchemaVersion || null);
    }
    setLoading(false);
  }, []);

  const fetchChanges = useCallback(async (versionId?: string) => {
    let query = supabase
      .from("schema_changes")
      .select("*")
      .order("created_at", { ascending: false });

    if (versionId) {
      query = query.eq("schema_version_id", versionId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setChanges(data as SchemaChange[]);
    }
  }, []);

  useEffect(() => {
    fetchVersions();
    fetchChanges();
  }, [fetchVersions, fetchChanges]);

  // Record a new schema version
  const recordVersion = useCallback(
    async (version: {
      version: string;
      description: string;
      applied_by?: string | null;
      is_active?: boolean;
      rollback_sql?: string | null;
      migration_sql?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("schema_versions")
        .insert({
          version: version.version,
          description: version.description,
          applied_by: version.applied_by || null,
          is_active: version.is_active ?? false,
          rollback_sql: version.rollback_sql || null,
          migration_sql: version.migration_sql || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchVersions();
      return data;
    },
    [fetchVersions]
  );

  // Record a schema change
  const recordChange = useCallback(
    async (change: {
      schema_version_id?: string | null;
      change_type: string;
      table_name?: string | null;
      old_definition?: Json | null;
      new_definition?: Json | null;
      backward_compatible?: boolean;
      deprecation_notice?: string | null;
      deprecation_deadline?: string | null;
    }) => {
      const { error } = await supabase.from("schema_changes").insert({
        schema_version_id: change.schema_version_id || null,
        change_type: change.change_type,
        table_name: change.table_name || null,
        old_definition: change.old_definition || null,
        new_definition: change.new_definition || null,
        backward_compatible: change.backward_compatible ?? true,
        deprecation_notice: change.deprecation_notice || null,
        deprecation_deadline: change.deprecation_deadline || null,
      });

      if (error) throw error;
      await fetchChanges();
    },
    [fetchChanges]
  );

  // Get pending deprecations
  const pendingDeprecations = changes.filter(
    (c) => c.deprecation_deadline && new Date(c.deprecation_deadline) > new Date()
  );

  // Get breaking changes
  const breakingChanges = changes.filter((c) => !c.backward_compatible);

  // Check rollback readiness
  const isRollbackReady = activeVersion?.rollback_sql != null;

  return {
    versions,
    changes,
    activeVersion,
    loading,
    pendingDeprecations,
    breakingChanges,
    isRollbackReady,
    recordVersion,
    recordChange,
    refresh: fetchVersions,
    fetchChanges,
  };
}
