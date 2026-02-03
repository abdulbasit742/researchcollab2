import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PermissionDefinition {
  id: string;
  action_key: string;
  entity_type: string;
  description: string | null;
  is_stripe_related: boolean;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: "student" | "researcher" | "admin";
  action_key: string;
  allowed: boolean;
  created_at: string;
}

export interface ContextualPermission {
  id: string;
  user_id: string;
  context_type: string;
  context_id: string;
  action_key: string;
  allowed: boolean;
  expires_at: string | null;
  granted_by: string | null;
  created_at: string;
}

export interface PermissionAuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_table: string;
  target_id: string | null;
  action_key: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
  admin_name?: string;
}

interface PermissionCache {
  [key: string]: boolean;
}

export function usePermissions() {
  const { user, userRole } = useAuth();
  const [permissionCache, setPermissionCache] = useState<PermissionCache>({});
  const [loading, setLoading] = useState(false);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    async (
      actionKey: string,
      contextType?: string,
      contextId?: string
    ): Promise<boolean> => {
      if (!user) return false;

      // Admin bypass
      if (userRole?.role === "admin") return true;

      // Check cache first
      const cacheKey = `${actionKey}:${contextType || ""}:${contextId || ""}`;
      if (cacheKey in permissionCache) {
        return permissionCache[cacheKey];
      }

      try {
        const { data, error } = await supabase.rpc("check_permission", {
          _user_id: user.id,
          _action_key: actionKey,
          _context_type: contextType || null,
          _context_id: contextId || null,
        });

        if (error) {
          console.error("Permission check error:", error);
          return false;
        }

        const allowed = data === true;
        setPermissionCache((prev) => ({ ...prev, [cacheKey]: allowed }));
        return allowed;
      } catch (err) {
        console.error("Permission check failed:", err);
        return false;
      }
    },
    [user, userRole, permissionCache]
  );

  // Synchronous permission check using cached role permissions
  const canSync = useCallback(
    (actionKey: string): boolean => {
      if (!userRole) return false;
      if (userRole.role === "admin") return true;

      const cacheKey = `${actionKey}::`;
      return permissionCache[cacheKey] ?? false;
    },
    [userRole, permissionCache]
  );

  // Load role permissions into cache on mount
  useEffect(() => {
    if (!userRole) return;

    const loadRolePermissions = async () => {
      try {
        const { data, error } = await supabase
          .from("role_permissions")
          .select("action_key, allowed")
          .eq("role", userRole.role);

        if (error) throw error;

        const cache: PermissionCache = {};
        (data || []).forEach((perm) => {
          cache[`${perm.action_key}::`] = perm.allowed;
        });
        setPermissionCache(cache);
      } catch (err) {
        console.error("Failed to load role permissions:", err);
      }
    };

    loadRolePermissions();
  }, [userRole]);

  // Clear cache when user changes
  useEffect(() => {
    setPermissionCache({});
  }, [user?.id]);

  return {
    hasPermission,
    canSync,
    isAdmin: userRole?.role === "admin",
    loading,
  };
}

// Admin hook for managing permissions
export function usePermissionManagement() {
  const [definitions, setDefinitions] = useState<PermissionDefinition[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [contextualPermissions, setContextualPermissions] = useState<ContextualPermission[]>([]);
  const [auditLogs, setAuditLogs] = useState<PermissionAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [defsRes, rolePermsRes, contextRes, auditRes] = await Promise.all([
        supabase
          .from("permission_definitions")
          .select("*")
          .order("entity_type")
          .order("action_key"),
        supabase
          .from("role_permissions")
          .select("*")
          .order("role")
          .order("action_key"),
        supabase
          .from("contextual_permissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("permission_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (defsRes.error) throw defsRes.error;
      if (rolePermsRes.error) throw rolePermsRes.error;
      if (contextRes.error) throw contextRes.error;
      if (auditRes.error) throw auditRes.error;

      setDefinitions(defsRes.data as PermissionDefinition[] || []);
      setRolePermissions(rolePermsRes.data as RolePermission[] || []);
      setContextualPermissions(contextRes.data as ContextualPermission[] || []);

      // Enrich audit logs with admin names
      const adminIds = [...new Set((auditRes.data || []).map((l) => l.admin_id))];
      if (adminIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, first_name, last_name")
          .in("id", adminIds);

        const nameMap = new Map(
          (profiles || []).map((p) => [
            p.id,
            p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown",
          ])
        );

        setAuditLogs(
          (auditRes.data || []).map((log) => ({
            ...log,
            admin_name: nameMap.get(log.admin_id) || "Unknown Admin",
          })) as PermissionAuditLog[]
        );
      } else {
        setAuditLogs(auditRes.data as PermissionAuditLog[] || []);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Update a role permission
  const updateRolePermission = async (
    role: "student" | "researcher" | "admin",
    actionKey: string,
    allowed: boolean,
    reason?: string
  ) => {
    try {
      const existing = rolePermissions.find(
        (p) => p.role === role && p.action_key === actionKey
      );

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Log the change
      await supabase.from("permission_audit_logs").insert({
        admin_id: userData.user.id,
        action_type: "modify",
        target_table: "role_permissions",
        target_id: existing?.id || null,
        action_key: actionKey,
        old_value: existing ? { role, allowed: existing.allowed } : null,
        new_value: { role, allowed },
        reason: reason || null,
      });

      if (existing) {
        const { error } = await supabase
          .from("role_permissions")
          .update({ allowed })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role, action_key: actionKey, allowed });

        if (error) throw error;
      }

      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error("Failed to update role permission:", err);
      return { success: false, error: err.message };
    }
  };

  // Grant contextual permission
  const grantContextualPermission = async (
    userId: string,
    contextType: string,
    contextId: string,
    actionKey: string,
    expiresAt?: string,
    reason?: string
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("contextual_permissions").insert({
        user_id: userId,
        context_type: contextType,
        context_id: contextId,
        action_key: actionKey,
        allowed: true,
        expires_at: expiresAt || null,
        granted_by: userData.user.id,
      });

      if (error) throw error;

      // Log the change
      await supabase.from("permission_audit_logs").insert({
        admin_id: userData.user.id,
        action_type: "grant",
        target_table: "contextual_permissions",
        action_key: actionKey,
        new_value: { user_id: userId, context_type: contextType, context_id: contextId, allowed: true },
        reason: reason || null,
      });

      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error("Failed to grant contextual permission:", err);
      return { success: false, error: err.message };
    }
  };

  // Revoke contextual permission
  const revokeContextualPermission = async (id: string, reason?: string) => {
    try {
      const existing = contextualPermissions.find((p) => p.id === id);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("contextual_permissions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log the change
      await supabase.from("permission_audit_logs").insert({
        admin_id: userData.user.id,
        action_type: "revoke",
        target_table: "contextual_permissions",
        target_id: id,
        action_key: existing?.action_key || "unknown",
        old_value: existing ? { ...existing } : null,
        reason: reason || null,
      });

      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error("Failed to revoke contextual permission:", err);
      return { success: false, error: err.message };
    }
  };

  // Get permission matrix for display
  const permissionMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, boolean>> = {
      student: {},
      researcher: {},
      admin: {},
    };

    rolePermissions.forEach((perm) => {
      matrix[perm.role][perm.action_key] = perm.allowed;
    });

    return matrix;
  }, [rolePermissions]);

  // Group definitions by entity type
  const definitionsByEntity = useMemo(() => {
    const grouped: Record<string, PermissionDefinition[]> = {};
    definitions.forEach((def) => {
      if (!grouped[def.entity_type]) {
        grouped[def.entity_type] = [];
      }
      grouped[def.entity_type].push(def);
    });
    return grouped;
  }, [definitions]);

  return {
    definitions,
    rolePermissions,
    contextualPermissions,
    auditLogs,
    loading,
    permissionMatrix,
    definitionsByEntity,
    updateRolePermission,
    grantContextualPermission,
    revokeContextualPermission,
    refetch: fetchAll,
  };
}

// Frontend permission guard component helper
export function usePermissionGuard(actionKey: string, contextType?: string, contextId?: string) {
  const { hasPermission } = usePermissions();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      setChecking(true);
      const result = await hasPermission(actionKey, contextType, contextId);
      if (mounted) {
        setAllowed(result);
        setChecking(false);
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [actionKey, contextType, contextId, hasPermission]);

  return { allowed, checking };
}
