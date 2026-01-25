import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Json;
  created_at: string;
  admin_name?: string;
}

export type AuditAction =
  | "user_blocked"
  | "user_unblocked"
  | "user_role_changed"
  | "verification_approved"
  | "verification_rejected"
  | "dispute_resolved"
  | "tool_created"
  | "tool_updated"
  | "tool_deleted"
  | "project_deleted"
  | "settings_updated"
  | "order_fulfilled"
  | "subscription_cancelled"
  | "subscription_extended"
  | "report_resolved"
  | "report_dismissed";

export type EntityType =
  | "user"
  | "verification"
  | "dispute"
  | "tool"
  | "project"
  | "settings"
  | "order"
  | "subscription"
  | "report";

export function useAdminAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (filters?: {
    action?: string;
    entityType?: string;
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.entityType) {
        query = query.eq("entity_type", filters.entityType);
      }
      if (filters?.adminId) {
        query = query.eq("admin_id", filters.adminId);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch admin names
      const adminIds = [...new Set((data || []).map((log) => log.admin_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name")
        .in("id", adminIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [
          p.id,
          p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown Admin",
        ])
      );

      const enrichedLogs = (data || []).map((log) => ({
        ...log,
        admin_name: profileMap.get(log.admin_id) || "Unknown Admin",
      }));

      setLogs(enrichedLogs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    action: AuditAction,
    entityType: EntityType,
    entityId?: string,
    details?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { error } = await supabase.from("admin_audit_logs").insert({
        admin_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || {},
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error logging action:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    logs,
    loading,
    fetchLogs,
    logAction,
  };
}

// Standalone function for use in other hooks
export async function logAdminAction(
  action: AuditAction,
  entityType: EntityType,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
    });
  } catch (err) {
    console.error("Error logging admin action:", err);
  }
}

// Helper to notify all admins
export async function notifyAdmins(
  type: string,
  title: string,
  message?: string,
  data?: Record<string, any>
) {
  try {
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!admins || admins.length === 0) return;

    const notifications = admins.map((admin) => ({
      user_id: admin.user_id,
      type,
      title,
      message: message || "",
      data: data || {},
    }));

    await supabase.from("notifications").insert(notifications);
  } catch (err) {
    console.error("Error notifying admins:", err);
  }
}
